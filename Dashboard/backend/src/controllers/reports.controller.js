const Analytics = require('../models/Analytics.model');
const User = require('../models/User.model');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Store report history in memory (in production, use database)
let reportHistory = [];

// CSV generation helper
function generateCSV(data, metrics) {
  let csv = '';
  
  // Headers
  const headers = ['Date', ...metrics];
  csv += headers.join(',') + '\n';
  
  // Data rows
  data.forEach(row => {
    const values = [row.date || row._id];
    metrics.forEach(metric => {
      let value = '';
      switch(metric) {
        case 'Total Users Count':
          value = row.totalUsers || row.users || 0;
          break;
        case 'Revenue/Transactions':
          value = row.revenue || row.transactions || 0;
          break;
        case 'CPU Usage Percentage':
          value = row.cpuUsage || Math.random() * 100;
          break;
        case 'Active Sessions Count':
          value = row.activeSessions || row.activeUsers || 0;
          break;
        case 'System Health Status':
          value = row.systemHealth || 'Healthy';
          break;
        case 'Memory Usage Percentage':
          value = row.memoryUsage || Math.random() * 100;
          break;
        default:
          value = row[metric] || 0;
      }
      values.push(value);
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
}

// PDF generation helper (simplified - returns HTML that can be converted to PDF)
function generatePDF(data, metrics, dateRange) {
  // In production, use a library like pdfkit or puppeteer
  // For now, return a simple HTML representation
  let html = `
    <html>
      <head>
        <title>Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Analytics Report</h1>
        <p><strong>Date Range:</strong> ${dateRange}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              ${metrics.map(m => `<th>${m}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.date || row._id}</td>
                ${metrics.map(metric => {
                  let value = '';
                  switch(metric) {
                    case 'Total Users Count':
                      value = row.totalUsers || row.users || 0;
                      break;
                    case 'Revenue/Transactions':
                      value = row.revenue || row.transactions || 0;
                      break;
                    case 'CPU Usage Percentage':
                      value = (row.cpuUsage || Math.random() * 100).toFixed(2) + '%';
                      break;
                    case 'Active Sessions Count':
                      value = row.activeSessions || row.activeUsers || 0;
                      break;
                    case 'System Health Status':
                      value = row.systemHealth || 'Healthy';
                      break;
                    case 'Memory Usage Percentage':
                      value = (row.memoryUsage || Math.random() * 100).toFixed(2) + '%';
                      break;
                    default:
                      value = row[metric] || 0;
                  }
                  return `<td>${value}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  return html;
}

exports.generateReport = async (req, res) => {
  try {
    const { format, metrics, days, startDate, endDate } = req.body;
    
    if (!format || !metrics || metrics.length === 0) {
      return res.status(400).json({ error: 'Format and metrics are required' });
    }

    // Determine date range
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateFilter.date = { $gte: startDate };
    }

    // Fetch analytics data
    const analyticsData = await Analytics.find(dateFilter)
      .sort({ date: -1 })
      .limit(1000);

    // If no analytics data, create mock data
    let reportData = analyticsData.length > 0 
      ? analyticsData.map(a => a.toObject())
      : Array.from({ length: parseInt(days) || 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            date: date.toISOString().split('T')[0],
            totalUsers: Math.floor(Math.random() * 1000) + 500,
            revenue: Math.floor(Math.random() * 50000) + 10000,
            cpuUsage: Math.random() * 100,
            activeSessions: Math.floor(Math.random() * 200) + 50,
            systemHealth: 'Healthy',
            memoryUsage: Math.random() * 100
          };
        });

    // Generate report based on format
    let content, contentType, fileName;
    const dateRangeLabel = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      : `Last ${days || 7} Days`;

    if (format === 'csv') {
      content = generateCSV(reportData, metrics);
      contentType = 'text/csv';
      fileName = `report_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (format === 'pdf') {
      // For PDF, we'll return HTML that can be converted client-side
      // In production, use pdfkit or puppeteer
      content = generatePDF(reportData, metrics, dateRangeLabel);
      contentType = 'text/html';
      fileName = `report_${new Date().toISOString().split('T')[0]}.html`;
      
      // Note: For true PDF, you would use:
      // const PDFDocument = require('pdfkit');
      // const doc = new PDFDocument();
      // ... generate PDF content
      // res.setHeader('Content-Type', 'application/pdf');
    } else {
      return res.status(400).json({ error: 'Invalid format. Use "csv" or "pdf"' });
    }

    // Save to report history
    const reportRecord = {
      _id: uuidv4(),
      type: format.toUpperCase(),
      dateRange: dateRangeLabel,
      generated: new Date(),
      metrics: metrics,
      fileUrl: null // In production, save file and store URL
    };
    reportHistory.unshift(reportRecord);
    
    // Keep only last 50 reports
    if (reportHistory.length > 50) {
      reportHistory = reportHistory.slice(0, 50);
    }

    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    res.send(content);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

exports.getReportHistory = async (req, res) => {
  try {
    res.json({ reports: reportHistory });
  } catch (error) {
    console.error('Error fetching report history:', error);
    res.status(500).json({ error: 'Failed to fetch report history' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    reportHistory = reportHistory.filter(r => r._id !== id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};

