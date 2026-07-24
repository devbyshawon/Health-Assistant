import { Link } from "react-router-dom";

const QuickActionCard = ({ to, icon: Icon, title, description, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
    };

    return (
        <Link
            to={to}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition duration-200"
        >
            <div className="flex items-center gap-4">
                <div className={`${colors[color]} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                </div>

                <div>
                    <h3 className="font-semibold text-teal-900">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
        </Link>
    );
};

export default QuickActionCard;