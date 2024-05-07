import { exec } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

function scheduleTask(type) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const scriptPath = join(__dirname, '..', 'schedule.bat');

    const startTime = `00:00:00`;

    const taskOptions = {
        '86400': { scheduleCommand: `schtasks /create /tn "Vidyascape Daily Leaderboard" /tr "\\"${scriptPath}\\" 86400" /sc daily /st ${startTime} /f`, taskName: 'Vidyascape Daily Leaderboard' },
        '604800': { scheduleCommand: `schtasks /create /tn "Vidyascape Weekly Leaderboard" /tr "\\"${scriptPath}\\" 604800" /sc weekly /st ${startTime} /f`, taskName: 'Vidyascape Weekly Leaderboard' },
        '2592000': { scheduleCommand: `schtasks /create /tn "Vidyascape Monthly Leaderboard" /tr "\\"${scriptPath}\\" 2592000" /sc monthly /st ${startTime} /f`, taskName: 'Vidyascape Monthly Leaderboard' }
    }

    const config = taskOptions[type] || taskOptions['86400'];
    const { scheduleCommand, taskName } = config;

    exec(scheduleCommand, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error scheduling task: ${err.message}`);
        }

        if (stderr) {
            console.error(`Error scheduling task: ${stderr}`);
        }

        console.log(`Scheduled task: ${taskName}`);
    });
}

export { scheduleTask };