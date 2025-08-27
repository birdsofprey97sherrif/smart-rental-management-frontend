import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from '../utils/axiosInstance';
import debounce from 'lodash.debounce';
import { useToast } from '../context/ToastContext';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { showToast } = useToast();

    const fetchLogs = useCallback(async (query = '', pageNum = 1) => {
        try {
            const { data } = await axios.get('/admin/admin/audit-logs', {
                params: { search: query, page: pageNum, limit: 10 },
            });
            setLogs(data);
            setTotalPages(data.totalPages);
            setPage(data.currentPage);
        } catch (err) {
            showToast('Failed to fetch audit logs', 'error');
        }
    }, [showToast]);

    useEffect(() => {
        fetchLogs(search, page);
    }, [search, page, fetchLogs]);

    const debouncedSearch = useMemo(
        () => debounce((value) => {
            setPage(1);
            setSearch(value);
        }, 500),
        []
    );

    // ✅ CSV Export (inside so it can access logs)
    const exportCSV = () => {
        const csv = Papa.unparse(
            logs.map(({ timestamp, action, actor, target, notes }) => ({
                Date: new Date(timestamp).toLocaleString(),
                Action: action,
                Actor: actor,
                Target: target,
                Notes: notes,
            }))
        );

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'audit_logs.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ✅ PDF Export (inside so it can access logs)
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('Audit Logs Report', 14, 16);

        const tableData = logs.map(log => [
            new Date(log.timestamp).toLocaleString(),
            log.action,
            log.actor,
            log.target,
            log.notes
        ]);
        console.log(tableData);

        doc.autoTable({
            head: [['Date', 'Action', 'Actor', 'Target', 'Notes']],
            body: tableData,
            startY: 20,
            styles: { fontSize: 8 }
        });

        doc.save('audit_logs.pdf');
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-3 fw-bold text-dark">🕵️ Audit Logs</h2>

            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Search by actor, action, or target"
                    className="form-control"
                    onChange={(e) => debouncedSearch(e.target.value)}
                />
            </div>

            <div className="d-flex justify-content-end gap-2 mb-3">
                <button className="btn btn-outline-primary" onClick={exportCSV}>
                    📥 Export CSV
                </button>
                <button className="btn btn-outline-danger" onClick={exportPDF}>
                    🖨️ Export PDF
                </button>
            </div>

            <table className="table table-bordered table-striped">
                <thead className="table-secondary">
                    <tr>
                        <th>Date</th>
                        <th>Action</th>
                        <th>Actor</th>
                        <th>Target</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log._id}>
                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                            <td>{log.action}</td>
                            <td>{log.actor}</td>
                            <td>{log.target}</td>
                            <td>{log.notes}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="d-flex justify-content-between">
                <button className="btn btn-outline-secondary" onClick={() => setPage(page - 1)} disabled={page === 1}>
                    ⬅️ Prev
                </button>
                <span className="align-self-center">Page {page} of {totalPages}</span>
                <button className="btn btn-outline-secondary" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                    Next ➡️
                </button>
            </div>
        </div>
    );
}
