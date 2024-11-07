import { saveAs } from 'file-saver';
import { parse } from 'json2csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToCSV = (data: any[], filename: string) => {
    try {
        const csv = parse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, filename);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
    }
};



export const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, filename);
};


export const exportToPDF = (data: any[], filename: string) => {
    const doc = new jsPDF();

    // Define columns and rows for the table
    const columns = Object.keys(data[0]);
    const rows = data.map(item => columns.map(column => item[column]));

    doc.autoTable({
        head: [columns],
        body: rows,
    });

    doc.save(filename);
};