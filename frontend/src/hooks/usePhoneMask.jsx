export const usePhoneMask = (value, setValue) => {

    const formatPhone = (input) => {
        const digits = input.replace(/\D/g, '').slice(0, 11);

        if (digits.length <= 10) {
            return digits
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        }

        return digits
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2');
    };

    const handleChange = (e) => {
        setValue(formatPhone(e.target.value));
    };

    return { handleChange };
};