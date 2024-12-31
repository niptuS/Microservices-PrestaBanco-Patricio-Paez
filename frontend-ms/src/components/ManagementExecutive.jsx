import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { Typography, Stack, Button, Link, Paper } from "@mui/material";
import RequestService from "../services/request.service.js";
import LoanService from "../services/loan.service.js";
import { useTranslation } from 'react-i18next';

const ManagementExecutive = () => {
    const { t } = useTranslation();
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await RequestService.list();
                const requestsWithLoanData = await Promise.all(response.data.map(async request => {
                    if (request.idLoan) {
                        try {
                            const loanResponse = await LoanService.get(request.idLoan);
                            return { ...request, loan: loanResponse.data };
                        } catch (error) {
                            console.error(`Error loading loan data for loan ${request.idLoan}:`, error);
                            return { ...request, loan: null };
                        }
                    }
                    return { ...request, loan: null };
                }));
                setRequests(requestsWithLoanData);
            } catch (error) {
                console.error("Error loading the requests:", error);
                setError(t('failed_to_load_requests'));
            }
        };

        fetchRequests();
    }, []);

    const getLoanType = (selectedLoan) => {
        switch (selectedLoan) {
            case 1: return t("first_house");
            case 2: return t("second_house");
            case 3: return t("business_properties");
            case 4: return t("remodeling");
            default: return t("unknown");
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 1: return t("rejected");
            case 2: return t("evaluating_by_executive");
            case 3: return t("accepted");
            case 4: return t("cancelled_by_customer");
            case 5: return t("delivering_loan");
            case 6: return t("delivered_loan");
            default: return t("unknown");
        }
    };

    const handleChangeStatus = (requestId, newStatus) => {
        const request = {
            id: requestId,
            status: newStatus,
        };
        RequestService
            .update(request)
            .then(() => {
                alert(t('status_changed_to', { status: getStatusText(newStatus) }));
                setRequests(prevRequests =>
                    prevRequests.map(req =>
                        req.id === requestId ? { ...req, status: newStatus } : req
                    )
                );
            })
            .catch((error) => {
                console.error(`Error updating status for request ${requestId}:`, error);
                alert(t("failed_to_change_request_status"));
            });
    };

    const renderFiles = (loan) => {
        const requiredDocuments = {
            1: ['incomeDocument', 'appraisalCertificate', 'historicalCredit'],
            2: ['incomeDocument', 'appraisalCertificate', 'historicalCredit', 'firstHomeDeed'],
            3: ['businessFinancialState', 'incomeDocument', 'appraisalCertificate', 'businessPlan'],
            4: ['incomeDocument', 'remodelingBudget', 'appraisalCertificate'],
        };

        const fileFields = requiredDocuments[loan.selectedLoan] || [];
        const missingFiles = fileFields.filter(file => !loan[file]);

        return (
            <Box>
                <Typography variant="body2">{t('files_header')}:</Typography>
                <ul>
                    {fileFields.map((file, index) => (
                        loan[file] ? (
                            <li key={index}>
                                <Link href={`data:application/octet-stream;base64,${loan[file]}`} target="_blank" rel="noopener">
                                    {t(`files.${file.replace(/([A-Z])/g, '_$1').toLowerCase()}`)}
                                </Link>
                            </li>
                        ) : (
                            <li key={index} style={{ color: 'red' }}>
                                {t(`files.${file.replace(/([A-Z])/g, '_$1').toLowerCase()}`)} ({t('missing')})
                            </li>
                        )
                    ))}
                </ul>
                {missingFiles.length > 0 && (
                    <Typography variant="body2" color="error">
                        {t('missing_files_for_this_loan_type')}
                    </Typography>
                )}
            </Box>
        );
    };

    if (error) {
        return <Typography variant="body1" color="error">{error}</Typography>;
    }

    return (
        <Box sx={{ flexGrow: 1, padding: 3, paddingTop: '70px', backgroundColor: '#e3f2fd', minHeight: '100vh' }}>
            <Typography variant="h5" component="div" gutterBottom>
                {t('customer_requests_management')}
            </Typography>

            {requests.length === 0 ? (
                <Typography variant="body1">{t('no_requests_available')}</Typography>
            ) : (
                <Stack spacing={2}>
                    {requests.map(request => (
                        <Paper key={request.id} sx={{ padding: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    {request.loan && (
                                        <>
                                            <Typography variant="body2">
                                                {t('loan_type')}: {getLoanType(request.loan.selectedLoan)}
                                            </Typography>
                                            <Typography variant="body2">
                                                {t('years')}: {request.loan.selectedYears}
                                            </Typography>
                                            <Typography variant="body2">
                                                {t('interest')}: {request.loan.selectedInterest}%
                                            </Typography>
                                            <Typography variant="body2">
                                                {t('property_value')}: ${request.loan.propertyValue}
                                            </Typography>
                                            {renderFiles(request.loan)}
                                        </>
                                    )}
                                    <Typography variant="body2">
                                        {t('status')}: {getStatusText(request.status)}
                                    </Typography>
                                </Box>
                                <Box>
                                    {request.status === 2 && (
                                        <>
                                            <Button variant="contained" color="primary" onClick={() => handleChangeStatus(request.id, 3)}>
                                                {t('accept')}
                                            </Button>
                                            <Button variant="contained" color="secondary" onClick={() => handleChangeStatus(request.id, 1)} style={{ marginLeft: 10 }}>
                                                {t('reject')}
                                            </Button>
                                        </>
                                    )}
                                    {request.status === 3 && (
                                        <Button variant="contained" color="success" onClick={() => handleChangeStatus(request.id, 5)}>
                                            {t('deliver_loan')}
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default ManagementExecutive;