export const formatDate = (inputdate) => {
  // setHumanTime(data.timestamp);
    const timestampUTC = new Date(inputdate); // parse the ISO string into a Date object
    const timestampEST = new Date(timestampUTC.getTime()); // + (4 * 60 * 60 * 1000)); // subtract 5 hours from UTC to get EST
    let hour = timestampEST.getHours();
    let ampm = 'am'
    if (hour == 0){
      hour = 12;
    } else if (hour > 12){
      hour = hour - 12;
      ampm = 'pm'
    } 
    return (timestampEST.getMonth() + 1) + '/' + timestampEST.getDate() + '/' + timestampEST.getFullYear() + ' ' 
      + hour + ':' + String(timestampEST.getMinutes()).padStart(2, '0') + ampm;
  }

export const formatDateNoTime = (inputdate) => {
    const timestampUTC = new Date(inputdate); // parse the ISO string into a Date object
    return (timestampUTC.getMonth() + 1) + '/' + timestampUTC.getDate() + '/' + timestampUTC.getFullYear();
  }
  
  export const formatAmount = (amountInCents) => {
    if (amountInCents === null || amountInCents === undefined) return "N/A";
    const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountInCents / 100);
    return formattedAmount;
  };