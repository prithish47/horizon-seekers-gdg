export async function initiatePayment(request) {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
    try {
        const response = await fetch(`${API_BASE}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });

        if (response.status === 504) {
            return { data: null, error: "Network Timeout Simulated", status: 504 };
        }

        const data = await response.json();

        if (!response.ok) {
            return { data: data, error: data.message || "Request Failed", status: response.status };
        }

        return { data: data, error: null, status: response.status };

    } catch (error) {
        return { data: null, error: error.message || "Network Error", status: 0 };
    }
}
