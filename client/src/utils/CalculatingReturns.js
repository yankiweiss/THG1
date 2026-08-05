import {
  eachDayOfInterval,
  parseISO,
  startOfDay,
  startOfQuarter,
} from "date-fns";

export const expectedAndActualQuarterReturns = (
  ddYear,
  initialInvestment,
  events,
  perfReturn,
  closingDate,
) => {
  const chartData = [];

  const dealOverview = {
    startDate: startOfDay(parseISO(closingDate)),
    endingDate: startOfDay(new Date()),
  };

  const yearStart = startOfDay(new Date(ddYear, 0, 1));
  const yearEnd = startOfDay(new Date(ddYear, 11, 31));

  const activeStartDay =
    dealOverview.startDate > yearStart ? dealOverview.startDate : yearStart;
  const activeEndDay =
    dealOverview.endingDate < yearEnd ? dealOverview.endingDate : yearEnd;

  const nonReturnEv = events?.filter((event) => event.event_type !== "Return");

  let toYearInvestmentAmount = initialInvestment;

  for (let i = 0; i < nonReturnEv.length; i++) {
    if (
      new Date(nonReturnEv[i].event_date).getTime() <
      new Date(activeStartDay).getTime()
    ) {
      if (nonReturnEv[i].event_type === "Return to Capital") {
        toYearInvestmentAmount -= Number(nonReturnEv[i].event_amount);
      } else if (
        nonReturnEv[i].event_type === "Investment" ||
        nonReturnEv[i].event_type === "Capital Call"
      ) {
        toYearInvestmentAmount += Number(nonReturnEv[i].event_amount);
      }
    }
  }

  let totalReturnAmount = 0;
  let totalActualReturnAmount = 0;
  let quarter = startOfQuarter(new Date(activeStartDay));

  for (
    let i = new Date(activeStartDay);
    i.getTime() <= activeEndDay.getTime();
    i.setDate(i.getDate() + 1)
  ) {
    let currentQuarter = startOfQuarter(i);

    if (currentQuarter.getTime() !== quarter.getTime()) {
      chartData.push({
        quarter: quarter,
        expected: Number(totalReturnAmount.toFixed(2)),
        actual: Number(totalActualReturnAmount.toFixed(2)),
      });
      quarter = currentQuarter;
      totalReturnAmount = 0;
      totalActualReturnAmount = 0;
    }

    for (let j = 0; j < events.length; j++) {
      if (events[j].event_date) {
        const currentEvent = parseISO(events[j].event_date);
        if (
          currentEvent.toDateString() == i.toDateString() &&
          currentEvent.getTime() <= activeEndDay.getTime()
        ) {
          if (events[j].event_type === "Return to Capital") {
            toYearInvestmentAmount -= Number(events[j].event_amount);
          } else if (
            events[j].event_type === "Investment" ||
            events[j].event_type === "Capital Call"
          ) {
            toYearInvestmentAmount += Number(events[j].event_amount);
          }
        }
      }

      if (events[j].event_type === "Return") {
        const currentReturnEvent = eachDayOfInterval({
          start: parseISO(events[j].from),
          end: parseISO(events[j].to),
        });

        const dailyReturn =
          Number(events[j].event_amount) / currentReturnEvent.length;

        for (const day of currentReturnEvent) {
          if (day.toDateString() == i.toDateString()) {
            totalActualReturnAmount += dailyReturn;
          }
        }
      }
    }

    let amountPerDate =
      (Number(toYearInvestmentAmount) * (perfReturn / 100)) / 365;
    totalReturnAmount += Number(amountPerDate);
  }

  chartData.push({
    quarter: quarter,
    expected: Number(totalReturnAmount.toFixed(2)),
    actual: Number(totalActualReturnAmount.toFixed(2)),
  });

  const actualReturnData = chartData.map((data) => ({
    x: data.quarter,
    y: data.actual,
  }));
  const expectedReturnData = chartData.map((data) => ({
    x: data.quarter,
    y: data.expected,
  }));

 

  return { actualReturnData, expectedReturnData };
};

const investmentToDate = (initialInvestment, events) => {
  let toDateInvestment = 0;

  toDateInvestment += Number(initialInvestment);


  events?.forEach((event)=> {
    if (event.event_type === "Return to Capital") {
      toDateInvestment -= Number(event.event_amount);
    } else if (
      event.event_type === "Investment" ||
      event.event_type === "Capital Call"
    ) {
      toDateInvestment += Number(event.event_amount);
    }
  });

  return toDateInvestment;
};

const investmentActualReturn = (events) => {
  const returnEvents = events?.filter((event) => event.event_type === "Return");

  const totalReturn = returnEvents?.reduce((acc, evt) => {
    return acc + Number(evt.event_amount);
  }, 0);

  return totalReturn;
};

let investmentNow = 0;

const expectedReturnAmount = (
  closingDate,
  initialInvestment,
  events,
  perfReturn,
) => {
  const dealOverview = {
    start: parseISO(closingDate),
    end: new Date(),
  };

  investmentNow = Number(initialInvestment);

  let expectedReturn = 0;

  const nonReturnEv = events?.filter((event) => event.event_type !== "Return");

  for (
    let i = dealOverview.start;
    i <= dealOverview.end;
    i.setDate(i.getDate() + 1)
  ) {
    nonReturnEv?.forEach((event) => {
      const eventDate = parseISO(event.event_date);

      if (eventDate.toDateString() === i.toDateString()) {
        if (
          event.event_type === "Capital Call" ||
          event.event_type === "Investment"
        ) {
          investmentNow += Number(event.event_amount);
        } else if (event.event_type === "Return to Capital") {
          investmentNow -= Number(event.event_amount);
        }
      }
    });

    const dayReturn = (investmentNow * (perfReturn / 100)) / 365;
    expectedReturn += Number(dayReturn);

  }

  return expectedReturn;
};

export { investmentToDate, investmentActualReturn, expectedReturnAmount };
