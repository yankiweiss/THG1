import {
  addQuarters,
  eachDayOfInterval,
  eachQuarterOfInterval,
  eachYearOfInterval,
  endOfQuarter,
  getQuarter,
  isSameQuarter,
  max,
  min,
  parseISO,
  startOfQuarter,
} from "date-fns";

const actualReturns = (events, year) => {
  // only getting the Return events.
  const returnEvents = events?.filter((event) => event.event_type === "Return");

  const rawQuartersData = [];

  let combined = 0;

  returnEvents?.forEach((event) => {
    const fromDate = parseISO(event.from_date);
    const endDate = parseISO(event.to_date);
    const eventAmount = event.event_amount;

    // getting total of days per event.

    const startYear = new Date(year, 0, 1);
    const yearEnd = new Date(year, 12, 0);

    const clampSYear = fromDate > startYear ? fromDate : startYear;
    const clampEYear = endDate < yearEnd ? endDate : yearEnd;

    const days = eachDayOfInterval({
      start: fromDate,
      end: endDate,
    }).length;

    const eventAmountByDays = eventAmount / days;

    let start = startOfQuarter(clampSYear);

    let totalDays = 0;

    while (start <= clampEYear) {
      const qEnd = endOfQuarter(start);
      const qStart = startOfQuarter(start);
      const startDays = fromDate > qStart ? fromDate : qStart;
      const endDays = endDate < qEnd ? endDate : qEnd;

      if (startDays <= endDays) {
        totalDays = eachDayOfInterval({
          start: startDays,
          end: endDays,
        }).length;
      }

      const totalAmountPerQuarter = totalDays * eventAmountByDays;
      const quarter = startOfQuarter(new Date(start));
      rawQuartersData.push({ y: quarter, x: totalAmountPerQuarter.toFixed(2) });

      combined = rawQuartersData.reduce((acc, item) => {
        if (!acc[item.y]) {
          acc[item.y] = { x: item.y, y: 0 };
        }
        acc[item.y].y += Number(item.x);

        return acc;
      }, {});
      start = addQuarters(new Date(start), 1);
    }
  });

  const chartData = Object.values(combined);

  return chartData;
};

let totalAmountInvested;

// below will be a function to get back quarters expected return.

const expectedQuarterReturns = (
  year,
  initialInvestment,
  events,
  perfReturn,
  closingDate,
) => {
  // overall timeline from closing_date to date.
  const timelineArray = [];

  const chartJS = [];

  const years = eachYearOfInterval({
    start: new Date(closingDate),
    end: new Date(),
  });

  years.forEach((year) => {
    timelineArray.push({
      year: year.getFullYear(),
      quarters: [
        {
          quarter: 1,
          expectedReturn: 0,
          start: new Date(year.getFullYear(), 0, 1),
          end: new Date(year.getFullYear(), 3, 0),
        },
        {
          quarter: 2,
          expectedReturn: 0,
          start: new Date(year.getFullYear(), 3, 1),
          end: new Date(year.getFullYear(), 6, 0),
        },
        {
          quarter: 3,
          expectedReturn: 0,
          start: new Date(year.getFullYear(), 6, 1),
          end: new Date(year.getFullYear(), 9, 0),
        },
        {
          quarter: 4,
          expectedReturn: 0,
          start: new Date(year.getFullYear(), 9, 1),
          end: new Date(year.getFullYear(), 12, 0),
        },
      ],
    });
  });

  // will be the base on what to calculate on.

  const eventsAndDates = [
    {
      event: "initial-investment",
      amount: initialInvestment,
      date: closingDate,
    },
  ];

  const nonReturnEvents = events?.filter(
    (event) => event.event_type !== "Return",
  );

  nonReturnEvents?.forEach((evt) =>
    eventsAndDates.push({
      event: evt.event_type,
      amount: Number(evt.event_amount),
      date: evt.event_date,
    }),
  );

  const endDate = timelineArray[timelineArray.length - 1].quarters[3].end;

  eventsAndDates.forEach((evt) => {
    const eventStart = new Date(evt.date);
    //const endDate = new Date();
    const eventType = evt.event;
    const amount = evt.amount;

    timelineArray.forEach((year) => {
      year.quarters.forEach((q) => {
        const qStart = new Date(q.start);
        const qEnd = new Date(q.end);

        const overlapStart = max([eventStart.getTime(), qStart.getTime()]);
        const overlapEnd = min([endDate.getTime(), qEnd.getTime()]);

        const overlap = overlapEnd - overlapStart;

        const msInDays = 1000 * 60 * 60 * 24;

        const amountPD = (Number(amount) / 365) * (perfReturn / 100);

        const quarterAmount = (overlap / msInDays) * amountPD;

        if (overlap > 0) {
          if (eventType === "Return to Capital") {
            q.expectedReturn -= Number(quarterAmount);
          } else {
            q.expectedReturn += Number(quarterAmount);
          }
        }
      });
    });
  });

 const a = 2;
 console.log(a)

 const b = 5;
 console.log(b)

 const i = 10;
 console.log(i)


  timelineArray.forEach((year) => {
    year.quarters.forEach((q) => {
      chartJS.push({ x: q.start, y: Number(q.expectedReturn) });
    });
  });

  return { chartJS, totalExpected: expectedReturnAmount(timelineArray) };
};

const expectedReturnAmount = (timeline) => {
  let totalExpected = 0;
  timeline.forEach((year) => {
    year.quarters.forEach((q) => {
      totalExpected += Number(q.expectedReturn);
    });
  });

  return Number(totalExpected);
};

const investmentToDate = (initialInvestment, events) => {
  const amountAtClosing = initialInvestment;
  const allEvents = events;

  totalAmountInvested = amountAtClosing;

  allEvents?.forEach((evt) => {
    if (evt.event_type === "Capital Call" || evt.event_type === "Investment") {
      totalAmountInvested += Number(evt.event_amount);
    } else if (evt.event_type === "Return to Capital") {
      totalAmountInvested -= Number(evt.event_amount);
    }
  });

  return totalAmountInvested;
};

const investmentActualReturn = (events) => {
  const returnEvents = events?.filter((event) => event.event_type === "Return");

  const totalReturn = returnEvents?.reduce((acc, evt) => {
    return acc + Number(evt.event_amount);
  }, 0);

  return totalReturn;
};

const expectedReturn = (
  initialInvestment,
  events,
  perfRate,
  year,
  closingDate,
) => {
  const returnOnAmount = returnHelper(
    initialInvestment,
    events,
    perfRate,
    closingDate,
  );

  let expectedAmount = [];

  const returnPerYear = returnOnAmount / 365;

  const now = new Date();

  const daysFromClosing = now - new Date(closingDate);

  const totalReturn = daysFromClosing * returnPerYear;

  const dividedIntoQuarters = returnOnAmount / 4;

  for (let i = 0; i <= 11; i += 3) {
    const quarter = new Date(year, i, 1);

    const amount = Number(dividedIntoQuarters);

    expectedAmount.push({ x: quarter, y: amount });
  }

  return expectedAmount;
};

export {
  actualReturns,
  expectedReturn,
  expectedQuarterReturns,
  investmentToDate,
  investmentActualReturn,
  expectedReturnAmount,
};
