'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Target, 
  BarChart3, 
  Funnel,
  Phone,
  Mail,
  Building,
  Calendar,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  Activity,
  TrendingUp,
  DollarSign,
  Clock,
  FileText,
  Settings,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  PhoneCall,
  Video,
  Coffee,
  Mail as MailIcon,
  CalendarCheck,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Link as LinkIcon,
  User,
  Code
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  status: string;
  priority: string;
  score: number;
  source: string;
  estimatedValue?: number;
  currency: string;
  createdAt: string;
  lastContactAt?: string;
  businessCard?: {
    id: string;
    name: string;
    company: string;
    template: string;
  };
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    interactions: number;
    activities: number;
  };
}

interface LeadInteraction {
  id: string;
  leadId: string;
  type: string;
  direction: string;
  title: string;
  description?: string;
  duration?: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface LeadActivity {
  id: string;
  leadId: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface LeadForm {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isPublic: boolean;
  embedCode: string;
  submissions: number;
  createdAt: string;
}

interface Analytics {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageScore: number;
  totalEstimatedValue: number;
  averageResponseTime: number;
  revenuePerLead: number;
}

interface LeadManagementProps {
  userId: string;
}

interface LeadFormProps {
  formData: any;
  setFormData: (data: any) => void;
  t: (key: string) => string;
}

export default function LeadManagement({ userId }: LeadManagementProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedDeleteLead, setSelectedDeleteLead] = useState<Lead | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    message: '',
    interest: 'general',
    source: 'manual',
    priority: 'medium',
    estimatedValue: '',
    currency: 'USD',
    website: '',
    linkedin: '',
    twitter: '',
    address: '',
    city: '',
    country: '',
    tags: '',
    notes: ''
  });

  // Interaction form state
  const [interactionData, setInteractionData] = useState({
    type: 'call',
    direction: 'outbound',
    title: '',
    description: '',
    duration: ''
  });

  // Form creation state
  const [formCreationData, setFormCreationData] = useState({
    name: '',
    description: '',
    isActive: true,
    isPublic: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: false },
      { name: 'company', label: 'Company', type: 'text', required: false },
      { name: 'message', label: 'Message', type: 'textarea', required: false }
    ]
  });

  useEffect(() => {
    fetchLeads();
    fetchAnalytics();
    fetchForms();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      });
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/leads?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast({
        title: t('common.error'),
        description: t('leads.fetchError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/leads?page=1&limit=1');
      const data = await response.json();
      
      if (response.ok) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/lead-forms');
      const data = await response.json();
      
      if (response.ok) {
        setForms(data.forms || []);
      }
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    }
  };

  const fetchLeadDetails = async (leadId: string) => {
    try {
      const [interactionsResponse, activitiesResponse] = await Promise.all([
        fetch(`/api/leads/${leadId}/interactions`),
        fetch(`/api/leads/${leadId}/activities`)
      ]);

      if (interactionsResponse.ok) {
        const interactionsData = await interactionsResponse.json();
        setInteractions(interactionsData.interactions || []);
      }

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.activities || []);
      }
    } catch (error) {
      console.error('Failed to fetch lead details:', error);
    }
  };

  const handleCreateLead = async () => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: t('common.error'),
        description: 'User not authenticated',
        variant: "destructive"
      });
      return;
    }

    // Client-side validation
    if (!formData.name.trim()) {
      toast({
        title: t('common.error'),
        description: t('validation.nameRequired'),
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Submitting form with data:', formData);
      
      // Prepare submit data with proper formatting
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        company: formData.company.trim() || null,
        position: formData.position.trim() || null,
        message: formData.message.trim() || null,
        interest: formData.interest || 'general',
        source: formData.source || 'manual',
        priority: formData.priority || 'medium',
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue.toString()) : null,
        currency: formData.currency || 'TWD',
        website: formData.website.trim() || null,
        linkedin: formData.linkedin.trim() || null,
        twitter: formData.twitter.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        country: formData.country.trim() || null,
        tags: formData.tags.trim() || null,
        notes: formData.notes.trim() || null,
        userId: user.id // Add the user ID
      };
      
      console.log('Submit data:', submitData);

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const newLead = await response.json();
        console.log('Success response:', newLead);
        setLeads([newLead, ...leads]);
        setIsCreateDialogOpen(false);
        resetForm();
        toast({
          title: t('leads.createLead'),
          description: t('leads.leadCreatedSuccess'),
        });
        fetchAnalytics();
      } else {
        const error = await response.json();
        console.log('Error response:', error);
        toast({
          title: t('common.error'),
          description: error.error || error.message || t('leads.createLeadError'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to create lead:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('leads.createLeadError'),
        variant: "destructive"
      });
    }
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;

    try {
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null
        }),
      });

      if (response.ok) {
        const updatedLead = await response.json();
        setLeads(leads.map(lead => lead.id === selectedLead.id ? updatedLead : lead));
        setIsEditDialogOpen(false);
        resetForm();
        toast({
          title: t('leads.updateLead'),
          description: t('leads.leadUpdatedSuccess'),
        });
        fetchAnalytics();
      } else {
        const error = await response.json();
        toast({
          title: t('common.error'),
          description: error.error || t('leads.updateLeadError'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
      toast({
        title: t('common.error'),
        description: t('leads.updateLeadError'),
        variant: "destructive"
      });
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (response.ok) {
        const updatedLead = await response.json();
        setLeads(leads.map(lead => lead.id === leadId ? updatedLead : lead));
        toast({
          title: 'Status Updated',
          description: `Lead status changed to ${getStatusName(newStatus)}`,
        });
        fetchAnalytics();
      } else {
        const error = await response.json();
        toast({
          title: t('common.error'),
          description: error.error || t('leads.updateLeadError'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to update lead status:', error);
      toast({
        title: t('common.error'),
        description: t('leads.updateLeadError'),
        variant: "destructive"
      });
    }
  };

  const handleDeleteLead = async () => {
    if (!selectedDeleteLead) return;

    try {
      const response = await fetch(`/api/leads/${selectedDeleteLead.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLeads(leads.filter(lead => lead.id !== selectedDeleteLead.id));
        setIsDeleteDialogOpen(false);
        setSelectedLead(null);
        toast({
          title: t('leads.deleteLead'),
          description: t('leads.leadDeletedSuccess'),
        });
        fetchAnalytics();
      } else {
        toast({
          title: t('common.error'),
          description: t('leads.deleteLeadError'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast({
        title: t('common.error'),
        description: t('leads.deleteLeadError'),
        variant: "destructive"
      });
    }
  };

  const handleAddInteraction = async () => {
    if (!selectedLead) return;
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: t('common.error'),
        description: 'User not authenticated',
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/leads/${selectedLead.id}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...interactionData,
          duration: interactionData.duration ? parseInt(interactionData.duration) : null,
          userId: user.id
        }),
      });

      if (response.ok) {
        await fetchLeadDetails(selectedLead.id);
        setIsInteractionDialogOpen(false);
        resetInteractionForm();
        toast({
          title: t('leads.addInteraction'),
          description: t('leads.interactionLogged'),
        });
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        toast({
          title: t('common.error'),
          description: error.error || t('leads.interactionError'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to add interaction:', error);
      toast({
        title: t('common.error'),
        description: t('leads.interactionError'),
        variant: "destructive"
      });
    }
  };

  const handleCreateForm = async () => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: t('common.error'),
        description: 'User not authenticated',
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/lead-forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formCreationData,
          userId: user.id
        }),
      });

      if (response.ok) {
        const newForm = await response.json();
        setForms([newForm, ...forms]);
        setIsFormDialogOpen(false);
        resetFormCreation();
        toast({
          title: t('leads.createForm'),
          description: t('leads.formCreatedSuccess'),
        });
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        toast({
          title: t('common.error'),
          description: error.error || t('leads.createFormError'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to create form:', error);
      toast({
        title: t('common.error'),
        description: t('leads.createFormError'),
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      message: '',
      interest: 'general',
      source: 'manual',
      priority: 'medium',
      estimatedValue: '',
      currency: 'USD',
      website: '',
      linkedin: '',
      twitter: '',
      address: '',
      city: '',
      country: '',
      tags: '',
      notes: ''
    });
  };

  const resetInteractionForm = () => {
    setInteractionData({
      type: 'call',
      direction: 'outbound',
      title: '',
      description: '',
      duration: ''
    });
  };

  const resetFormCreation = () => {
    setFormCreationData({
      name: '',
      description: '',
      isActive: true,
      isPublic: true,
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'tel', required: false },
        { name: 'company', label: 'Company', type: 'text', required: false },
        { name: 'message', label: 'Message', type: 'textarea', required: false }
      ]
    });
  };

  const openEditDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      position: lead.position || '',
      message: '',
      interest: 'general',
      source: lead.source,
      priority: lead.priority,
      estimatedValue: lead.estimatedValue?.toString() || '',
      currency: lead.currency,
      website: '',
      linkedin: '',
      twitter: '',
      address: '',
      city: '',
      country: '',
      tags: '',
      notes: ''
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (lead: Lead) => {
    setSelectedDeleteLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const openLeadDetails = async (lead: Lead) => {
    setSelectedLead(lead);
    await fetchLeadDetails(lead.id);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      proposal_sent: 'bg-purple-100 text-purple-800',
      converted: 'bg-emerald-100 text-emerald-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getInteractionIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      call: <PhoneCall className="w-4 h-4" />,
      email: <MailIcon className="w-4 h-4" />,
      meeting: <CalendarCheck className="w-4 h-4" />,
      video: <Video className="w-4 h-4" />,
      coffee: <Coffee className="w-4 h-4" />,
      other: <MessageCircle className="w-4 h-4" />
    };
    return icons[type] || icons.other;
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesSource;
  });

  const getStatusName = (status: string) => {
    // For debugging - try hardcoded values first
    const statusNames: Record<string, string> = {
      'new': 'New',
      'contacted': 'Contacted', 
      'qualified': 'Qualified',
      'proposal_sent': 'Proposal Sent',
      'converted': 'Converted',
      'lost': 'Lost'
    };
    return statusNames[status] || status;
  };

  const getPriorityName = (priority: string) => {
    const priorityNames: Record<string, string> = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'Urgent'
    };
    return priorityNames[priority] || priority;
  };

  const getSourceName = (source: string) => {
    const sourceNames: Record<string, string> = {
      'manual': 'Manual',
      'website': 'Website',
      'referral': 'Referral',
      'social': 'Social Media',
      'email': 'Email',
      'event': 'Event',
      'cold_call': 'Cold Call',
      'advertisement': 'Advertisement'
    };
    return sourceNames[source] || source;
  };

  const pipelineStages = [
    { id: 'new', count: leads.filter(l => l.status === 'new').length },
    { id: 'contacted', count: leads.filter(l => l.status === 'contacted').length },
    { id: 'qualified', count: leads.filter(l => l.status === 'qualified').length },
    { id: 'proposal_sent', count: leads.filter(l => l.status === 'proposal_sent').length },
    { id: 'converted', count: leads.filter(l => l.status === 'converted').length },
    { id: 'lost', count: leads.filter(l => l.status === 'lost').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('leads.title')}</h1>
          <p className="text-muted-foreground">{t('leads.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t('leads.exportData')}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('leads.createNewLead')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('leads.createLead')}</DialogTitle>
                <DialogDescription>
                  {t('leads.createLeadDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('leads.name')} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('leads.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">{t('leads.phone')}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">{t('leads.company')}</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">{t('leads.position')}</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="source">{t('leads.source')}</Label>
                    <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Manual" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="cold_call">Cold Call</SelectItem>
                        <SelectItem value="advertisement">Advertisement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">{t('leads.priority')}</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedValue">{t('leads.estimatedValue')}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="estimatedValue"
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                      />
                      <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder={formData.currency} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="AUD">AUD</SelectItem>
                          <SelectItem value="CNY">CNY</SelectItem>
                          <SelectItem value="HKD">HKD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">{t('leads.message')}</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">{t('leads.notes')}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t('modal.cancel')}
                </Button>
                <Button onClick={handleCreateLead}>
                  {t('leads.createLead')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('leads.totalLeads')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.conversionRate}% {t('leads.conversionRate')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('leads.newLeads')}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.newLeads}</div>
              <p className="text-xs text-muted-foreground">
                {t('leads.thisMonth')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('leads.averageScore')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageScore}</div>
              <p className="text-xs text-muted-foreground">
                {t('leads.outOf100')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('leads.totalEstimatedValue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.totalEstimatedValue.toLocaleString()} TWD
              </div>
              <p className="text-xs text-muted-foreground">
                {t('leads.potentialRevenue')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leads" className="text-xs md:text-sm">{t('leads.leadsList')}</TabsTrigger>
          <TabsTrigger value="pipeline" className="text-xs md:text-sm">{t('leads.pipeline')}</TabsTrigger>
          <TabsTrigger value="forms" className="text-xs md:text-sm">{t('leads.forms')}</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs md:text-sm">{t('leads.analytics')}</TabsTrigger>
        </TabsList>

        {/* Leads List Tab */}
        <TabsContent value="leads" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {t('leads.filters')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('leads.searchLeads')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('leads.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('leads.allStatuses')}</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('leads.priority')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('leads.allPriorities')}</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('leads.source')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('leads.allSources')}</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('leads.leadsList')}</span>
                <Badge variant="secondary">
                  {filteredLeads.length} {t('leads.leadsFound')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>{t('common.loading')}</p>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('leads.noLeadsFound')}</h3>
                  <p className="text-muted-foreground mb-4">{t('leads.startByCreatingLead')}</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('leads.createNewLead')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{lead.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {lead.company && `${lead.company} • `}
                              {lead.position && `${lead.position}`}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(lead.status)}>
                                {getStatusName(lead.status)}
                              </Badge>
                              <Badge className={getPriorityColor(lead.priority)}>
                                {getPriorityName(lead.priority)}
                              </Badge>
                              <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                                {lead.score}/100
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openLeadDetails(lead)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(lead)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={isDeleteDialogOpen && selectedDeleteLead?.id === lead.id} onOpenChange={(open) => !open && setSelectedDeleteLead(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(lead)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('leads.deleteLead')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('leads.deleteLeadConfirm')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('modal.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteLead}>
                                {t('common.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Funnel className="h-5 w-5" />
                {t('leads.salesPipeline')}
              </CardTitle>
              <CardDescription>
                {t('leads.dragToReorder')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {pipelineStages.map((stage) => (
                  <div key={stage.id} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm">{getStatusName(stage.id)}</h3>
                      <Badge variant="secondary">{stage.count}</Badge>
                    </div>
                    <div className="space-y-2">
                      {leads
                        .filter(lead => lead.status === stage.id)
                        .slice(0, 3)
                        .map((lead) => (
                          <div key={lead.id} className="bg-background rounded p-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                            setSelectedLead(lead);
                            setIsEditDialogOpen(true);
                          }}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium">{lead.name}</div>
                              <Select value={lead.status} onValueChange={(value) => handleUpdateLeadStatus(lead.id, value)}>
                                <SelectTrigger className="w-24 h-6 text-xs" onClick={(e) => e.stopPropagation()}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="qualified">Qualified</SelectItem>
                                  <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                                  <SelectItem value="converted">Converted</SelectItem>
                                  <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {lead.company && (
                              <div className="text-muted-foreground">{lead.company}</div>
                            )}
                            <div className={`text-xs font-medium ${getScoreColor(lead.score)}`}>
                              {lead.score}/100
                            </div>
                          </div>
                        ))}
                      {leads.filter(lead => lead.status === stage.id).length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{leads.filter(lead => lead.status === stage.id).length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('leads.leadCaptureForms')}
                </div>
                <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('leads.createForm')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{t('leads.createForm')}</DialogTitle>
                      <DialogDescription>
                        {t('leads.createFormDescription')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="formName">{t('leads.formName')}</Label>
                        <Input
                          id="formName"
                          value={formCreationData.name}
                          onChange={(e) => setFormCreationData({ ...formCreationData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="formDescription">{t('leads.formDescription')}</Label>
                        <Textarea
                          id="formDescription"
                          value={formCreationData.description}
                          onChange={(e) => setFormCreationData({ ...formCreationData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
                        {t('modal.cancel')}
                      </Button>
                      <Button onClick={handleCreateForm}>
                        {t('leads.createForm')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {forms.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('leads.noFormsYet')}</h3>
                  <p className="text-muted-foreground mb-4">{t('leads.createFirstForm')}</p>
                  <Button onClick={() => setIsFormDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('leads.createForm')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {forms.map((form) => (
                    <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{form.name}</h3>
                        <p className="text-sm text-muted-foreground">{form.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={form.isActive ? "default" : "secondary"}>
                            {form.isActive ? t('leads.active') : t('leads.inactive')}
                          </Badge>
                          <Badge variant="outline">
                            {form.submissions} {t('leads.totalSubmissions')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          {t('leads.edit')}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Code className="h-4 w-4 mr-2" />
                          {t('leads.embedCode')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('leads.leadsByStatus')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pipelineStages.map((stage) => (
                    <div key={stage.id} className="flex items-center justify-between">
                      <span className="text-sm">{getStatusName(stage.id)}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(stage.count / leads.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stage.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('leads.conversionMetrics')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('leads.conversionRate')}</span>
                    <span className="text-lg font-bold">{analytics?.conversionRate || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('leads.averageResponseTime')}</span>
                    <span className="text-lg font-bold">{analytics?.averageResponseTime || 0}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('leads.revenuePerLead')}</span>
                    <span className="text-lg font-bold">
                      {analytics?.revenuePerLead?.toLocaleString() || 0} TWD
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('leads.leadDetails')}</DialogTitle>
            <DialogDescription>
              {selectedLead?.name} - {selectedLead?.company}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('leads.basicInfo')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{t('leads.name')}</Label>
                    <p>{selectedLead.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('leads.email')}</Label>
                    <p>{selectedLead.email || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('leads.phone')}</Label>
                    <p>{selectedLead.phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('leads.company')}</Label>
                    <p>{selectedLead.company || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('leads.position')}</Label>
                    <p>{selectedLead.position || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('leads.source')}</Label>
                    <p>{getSourceName(selectedLead.source)}</p>
                  </div>
                </div>
              </div>

              {/* Lead Scoring */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('leads.leadScoring')}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{t('leads.score')}</Label>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold">{selectedLead.score}</div>
                      <div className="text-sm text-muted-foreground">/100</div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('leads.status')}</Label>
                    <Badge className={getStatusColor(selectedLead.status)}>
                      {getStatusName(selectedLead.status)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('leads.priority')}</Label>
                    <Badge className={getPriorityColor(selectedLead.priority)}>
                      {getPriorityName(selectedLead.priority)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Interactions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t('leads.interactions')}</h3>
                  <Dialog open={isInteractionDialogOpen} onOpenChange={setIsInteractionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('leads.addInteraction')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('leads.addInteraction')}</DialogTitle>
                        <DialogDescription>
                          {t('leads.logInteraction')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="interactionType">{t('leads.interactionType')}</Label>
                            <Select value={interactionData.type} onValueChange={(value) => setInteractionData({ ...interactionData, type: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="call">{t('leads.interactionTypes.call')}</SelectItem>
                                <SelectItem value="email">{t('leads.interactionTypes.email')}</SelectItem>
                                <SelectItem value="meeting">{t('leads.interactionTypes.meeting')}</SelectItem>
                                <SelectItem value="video">{t('leads.interactionTypes.video')}</SelectItem>
                                <SelectItem value="coffee">{t('leads.interactionTypes.coffee')}</SelectItem>
                                <SelectItem value="other">{t('leads.interactionTypes.other')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="interactionDirection">{t('leads.interactionDirection')}</Label>
                            <Select value={interactionData.direction} onValueChange={(value) => setInteractionData({ ...interactionData, direction: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="inbound">{t('leads.interactionDirections.inbound')}</SelectItem>
                                <SelectItem value="outbound">{t('leads.interactionDirections.outbound')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="interactionTitle">{t('leads.interactionTitle')}</Label>
                          <Input
                            id="interactionTitle"
                            value={interactionData.title}
                            onChange={(e) => setInteractionData({ ...interactionData, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="interactionDescription">{t('leads.interactionDescription')}</Label>
                          <Textarea
                            id="interactionDescription"
                            value={interactionData.description}
                            onChange={(e) => setInteractionData({ ...interactionData, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="interactionDuration">{t('leads.interactionDuration')}</Label>
                          <Input
                            id="interactionDuration"
                            type="number"
                            value={interactionData.duration}
                            onChange={(e) => setInteractionData({ ...interactionData, duration: e.target.value })}
                            placeholder="30"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInteractionDialogOpen(false)}>
                          {t('modal.cancel')}
                        </Button>
                        <Button onClick={handleAddInteraction}>
                          {t('leads.saveInteraction')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-2">
                  {interactions.length === 0 ? (
                    <p className="text-muted-foreground">{t('leads.noInteractionsYet')}</p>
                  ) : (
                    interactions.map((interaction) => (
                      <div key={interaction.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-shrink-0">
                          {getInteractionIcon(interaction.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{interaction.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {t(`leads.interactionTypes.${interaction.type}`)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {t(`leads.interactionDirections.${interaction.direction}`)}
                              </Badge>
                              {interaction.duration && (
                                <span className="text-xs text-muted-foreground">
                                  {interaction.duration}min
                                </span>
                              )}
                            </div>
                          </div>
                          {interaction.description && (
                            <p className="text-sm text-muted-foreground mt-1">{interaction.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(interaction.createdAt).toLocaleDateString()} • {interaction.user.name}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Activities */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('leads.activity')}</h3>
                <div className="space-y-2">
                  {activities.length === 0 ? (
                    <p className="text-muted-foreground">{t('leads.noActivitiesYet')}</p>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.createdAt).toLocaleDateString()} • {activity.user.name}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLead(null)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('leads.editLead')}</DialogTitle>
            <DialogDescription>
              {t('leads.editLeadDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t('leads.name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">{t('leads.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">{t('leads.phone')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="company">{t('leads.company')}</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">{t('leads.position')}</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="source">{t('leads.source')}</Label>
                <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Manual" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">{t('leads.priority')}</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimatedValue">{t('leads.estimatedValue')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="estimatedValue"
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  />
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder={formData.currency} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                      <SelectItem value="HKD">HKD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="message">{t('leads.message')}</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">{t('leads.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('modal.cancel')}
            </Button>
            <Button onClick={handleUpdateLead}>
              {t('leads.updateLead')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}