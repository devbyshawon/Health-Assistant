const StatCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className='flex items-center justify-between'>
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                {Icon && (
                    <div className={`${colors[color]} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}  
            </div>
        </div>
  );
};

export default StatCard;