import httpClient from "../http-common.js";

const list = () => {
    return httpClient.get('/api/loan/');
}

const get = id => {
    return httpClient.get(`/api/loan/${id}`);
}

const update = data => {
    return httpClient.put('/api/loan/', data);
}

const save = data => {
    return httpClient.post('/api/loan/', data);
}

const remove = id => {
    return httpClient.delete(`/api/loan/${id}`);
}

const calculateLoan = async (loanData) => {
    try {
        const response = await httpClient.post('/loans/calculate', loanData);
        return response.data;
    } catch (error) {
        console.error('Error calculating loan:', error);
        throw error;
    }
};

export default { list, get, update, remove, save, calculateLoan};