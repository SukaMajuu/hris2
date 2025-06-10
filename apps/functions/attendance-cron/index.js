const axios = require('axios');

module.exports = async function (context, myTimer) {
    const timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        context.log('Timer function is running late!');
    }

    const BACKEND_URL = process.env.BACKEND_URL || 'https://your-app-service.azurewebsites.net';

    try {
        context.log('🚀 Starting attendance cron job at:', timeStamp);

        // Call the daily absent check endpoint
        context.log('📋 Running: Daily Absent Check');

        const response = await axios.post(`${BACKEND_URL}/v1/cron/process-daily-absent-check`, {}, {
            headers: {
                'Authorization': `Bearer ${process.env.CRON_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        if (response.status === 200) {
            context.log('✅ Daily Absent Check completed successfully');
            context.log('Response:', response.data);
        } else {
            context.log('❌ Daily Absent Check failed with status:', response.status);
        }

    } catch (error) {
        context.log('❌ Attendance cron job error:', error.message);

        if (error.response) {
            context.log('Error response:', error.response.data);
            context.log('Error status:', error.response.status);
        }

        throw error;
    }

    context.log('🏁 Attendance cron function completed at:', new Date().toISOString());
};
