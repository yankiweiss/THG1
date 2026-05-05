import {api } from '../api/data'

export const fetchInvestors = async (propertyID, investorID) => {
     const response = await api.get(`investor/${propertyID}/${investorID}`);
return response.data;
}
   