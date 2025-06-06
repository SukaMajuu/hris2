'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LeaveRecord {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: 'approved' | 'pending' | 'rejected';
  reason: string;
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
  attachment?: string;
}

export default function LeaveHistoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Mock data - replace with actual API call
  const leaveRecords: LeaveRecord[] = [
    {
      id: '1',
      type: 'Annual Leave',
      startDate: '2025-03-15',
      endDate: '2025-03-17',
      duration: 3,
      status: 'approved',
      reason: 'Family vacation',
      appliedDate: '2025-03-01',
      approvedBy: 'John Manager',
      approvedDate: '2025-03-02',
      attachment: 'vacation-plan.pdf'
    },
    {
      id: '2',
      type: 'Sick Leave',
      startDate: '2025-02-10',
      endDate: '2025-02-10',
      duration: 1,
      status: 'approved',
      reason: 'Flu symptoms',
      appliedDate: '2025-02-10',
      approvedBy: 'John Manager',
      approvedDate: '2025-02-10',
      attachment: 'medical-certificate.jpg'
    },
    {
      id: '3',
      type: 'Compassionate Leave',
      startDate: '2025-01-20',
      endDate: '2025-01-22',
      duration: 3,
      status: 'pending',
      reason: 'Family emergency',
      appliedDate: '2025-01-18'
    },
    {
      id: '4',
      type: 'Annual Leave',
      startDate: '2025-01-05',
      endDate: '2025-01-07',
      duration: 3,
      status: 'rejected',
      reason: 'New Year holiday',
      appliedDate: '2024-12-20',
      rejectedReason: 'Peak season - insufficient coverage'
    }
  ];

  const filteredRecords = leaveRecords.filter(record => {
    const matchesSearch = record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} capitalize`}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalDays = () => {
    return leaveRecords
      .filter(record => record.status === 'approved')
      .reduce((total, record) => total + record.duration, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave History</h1>
              <p className="text-gray-600">View and manage your leave requests</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Taken</p>
                    <p className="text-xl font-semibold text-gray-900">{calculateTotalDays()} Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {leaveRecords.filter(r => r.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {leaveRecords.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {leaveRecords.filter(r => r.status === 'rejected').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by leave type or reason..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Compassionate Leave">Compassionate Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Marriage Leave">Marriage Leave</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Records */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leave records found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{record.type}</h3>
                            {getStatusBadge(record.status)}
                          </div>
                          <p className="text-gray-600 mb-3">{record.reason}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 font-medium">Duration</p>
                              <p className="text-gray-900">{record.duration} day{record.duration > 1 ? 's' : ''}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium">Start Date</p>
                              <p className="text-gray-900">{formatDate(record.startDate)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium">End Date</p>
                              <p className="text-gray-900">{formatDate(record.endDate)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium">Applied</p>
                              <p className="text-gray-900">{formatDate(record.appliedDate)}</p>
                            </div>
                          </div>

                          {record.status === 'approved' && record.approvedBy && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-800">
                                  Approved by {record.approvedBy} on {formatDate(record.approvedDate!)}
                                </span>
                              </div>
                            </div>
                          )}

                          {record.status === 'rejected' && record.rejectedReason && (
                            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-start gap-2 text-sm">
                                <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                <div>
                                  <p className="text-red-800 font-medium">Rejection Reason:</p>
                                  <p className="text-red-700">{record.rejectedReason}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {record.status === 'pending' && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <span className="text-yellow-800">Waiting for approval</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {record.attachment && (
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          View Attachment
                        </Button>
                      )}
                      <div className="text-xs text-gray-500">
                        ID: {record.id}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
