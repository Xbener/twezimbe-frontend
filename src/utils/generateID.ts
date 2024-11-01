import moment from "moment";

export const generateProfileID = (national_id_number: string) => {
    const registrationDate = moment().format("DDMM");
    const year = moment().format("YY");

    const personalID = national_id_number
        ? national_id_number.padEnd(14, "0").slice(0, 14)
        : Math.random().toString(36).substring(2, 16).padEnd(14, "0");

    return `${registrationDate}${personalID}${year}`;
};
