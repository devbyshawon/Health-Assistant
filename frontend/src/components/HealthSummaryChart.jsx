import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HealthSummaryChart = ({ logs }) => {
    const chartData = logs
        .slice()
        .reverse()
        .map(log => ({
            date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weight: log.weight || null,
            heartRate: log.vitals?.heartRate || null,
            temperature: log.vitals?.temperature || null,
        }));

    if (chartData.length < 2) {
        return (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400 text-sm py-12'>
                Add at least 2 health logs to see your trend chart
            </div>
        );
    }

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='font-semibold text-gray-900 mb-4'>Weight Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
export default HealthSummaryChart;