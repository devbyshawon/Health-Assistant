const formatDoctorName = (name) => {
    if (!name) {
        return 'Doctor';
    }
    const cleaned = name.replace(/^\s*dr\.?\s+/i, '').trim();
    return `Dr. ${cleaned}`;
};

export default formatDoctorName;