"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faTwitter,
  faInstagram,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";



// API base URL - adjust as needed for your deployment
const API_URL = 'http://localhost:5000/api';

const App: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    areaOfInterest: '',
    sop: ''
  });
  
  const [applications, setApplications] = useState<Array<{
    id: number;
    fullName: string;
    email: string;
    areaOfInterest: string;
    sop: string;
    date: string;
  }>>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    ai: 0,
    robotics: 0,
    cybersecurity: 0,
    energy: 0,
    spaceTech: 0
  });
  
  const [submissionResponse, setSubmissionResponse] = useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: ''
  });
  
  // Add missing state variables for statement modal
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<{
    id: number;
    fullName: string;
    email: string;
    areaOfInterest: string;
    sop: string;
    date: string;
  } | null>(null);
  const [fullStatement, setFullStatement] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch applications when component mounts
  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  // Fetch applications based on filter
  useEffect(() => {
    if (filterValue === 'all') {
      fetchApplications();
    } else {
      fetchApplicationsByArea(filterValue);
    }
  }, [filterValue]);

  // Fetch all applications
  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/applications`);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  // Fetch applications by area
  const fetchApplicationsByArea = async (area: string) => {
    try {
      const response = await fetch(`${API_URL}/applications/${area}`);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications by area:', error);
    }
  };

  // Fetch application stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Search applications
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchApplications();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/search?term=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error searching applications:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, areaOfInterest: value }));
  };

  // Handle filter changes
  const handleFilterChange = (value: string) => {
    setFilterValue(value);
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      fetchApplications();
    }
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Handle viewing statement details
  const handleViewStatement = async (appId: number) => {
    // Find the application from the id
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    setCurrentApplication(app);
    setIsStatementModalOpen(true);
    setIsLoading(true);
    
    try {
      // In a real application, you'd fetch from your database here
      // For example: const response = await fetch(`${API_URL}/statements/${appId}`);
      
      // This is a simulated API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set the full statement (in a real app, you'd get this from the API response)
      setFullStatement(app.sop);
    } catch (error) {
      console.error("Error fetching statement:", error);
      setFullStatement("Error loading the statement. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Show success message
        setSubmissionResponse({
          show: true,
          message: data.message
        });
        
        // Clear form data
        setFormData({
          fullName: '',
          email: '',
          areaOfInterest: '',
          sop: ''
        });
        
        // Refresh applications and stats
        fetchApplications();
        fetchStats();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setSubmissionResponse({
            show: false,
            message: ''
          });
        }, 5000);
      } else {
        alert('Error submitting application: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again later.');
    }
  };

  // Get friendly name for area of interest
  const getFriendlyAreaName = (area: string) => {
    switch (area) {
      case 'AI': return 'AI & Machine Learning';
      case 'Robotics': return 'Robotics & Engineering';
      case 'Cybersecurity': return 'Cybersecurity';
      case 'Energy': return 'Clean Energy Solutions';
      case 'Space Tech': return 'Space Technology';
      default: return area;
    }
  };

  return (
    <div className="flex flex-col min-h-[1024px]">
      {/* Header */}
      <header className="bg-red-600 text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-yellow-300 mr-2">★</span>
          <h1 className="text-xl font-bold">STARK INDUSTRIES</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li><a href="#home" className="hover:underline cursor-pointer">Home</a></li>
            <li><a href="#application-section" className="hover:underline cursor-pointer">Apply</a></li>
            <li><a href="#" className="hover:underline cursor-pointer">Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
  
      <section id="home" className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://readdy.ai/api/search-image?query=futuristic%20high-tech%20laboratory%20with%20advanced%20robotics%20and%20holographic%20displays%2C%20blue%20and%20red%20lighting%2C%20sleek%20metal%20surfaces%2C%20Iron%20Man%20suit%20displayed%20in%20background%2C%20sci-fi%20technology%20environment%20with%20digital%20screens%20and%20control%20panels&width=1440&height=500&seq=hero-bg&orientation=landscape"
            alt="Stark Industries Lab"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-white px-12 py-24">
          <h2 className="text-4xl font-bold mb-4">
            Join the Future at Stark Industries
          </h2>
          <p className="text-xl max-w-2xl mb-8">
            We're looking for the brightest minds to shape tomorrow's
            technology. Apply for our exclusive internship program today.
          </p>
          <a
            href="#application-section"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("application-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full whitespace-nowrap shadow-md">
            <FontAwesomeIcon icon={faChevronRight} className="mr-2" /> Apply Now
            </Button>
          </a>
        </div>
      </section>

      

      {/* Program Categories */}
      <section className="py-16 px-12 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* AI & Machine Learning */}
          <Card className="overflow-hidden shadow-lg">
            <div className="h-48 overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=futuristic%20glowing%20blue%20brain%20with%20digital%20neural%20connections%2C%20neon%20blue%20and%20purple%20lighting%2C%20abstract%20technology%20background%20with%20data%20visualization%2C%20high-tech%20AI%20concept%20with%20electric%20synapses&width=400&height=250&seq=ai-ml&orientation=landscape"
                alt="AI & Machine Learning"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-bold">AI & Machine Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Work on cutting-edge AI systems that will define the future of technology and automation.
              </p>
            </CardContent>
          </Card>

          {/* Robotics & Engineering */}
          <Card className="overflow-hidden shadow-lg">
            <div className="h-48 overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=advanced%20red%20robotic%20arm%20in%20a%20futuristic%20manufacturing%20facility%2C%20blue%20and%20red%20lighting%2C%20high-tech%20engineering%20environment%20with%20precision%20machinery%2C%20industrial%20robotics%20with%20glowing%20components%20against%20metallic%20background&width=400&height=250&seq=robotics&orientation=landscape"
                alt="Robotics & Engineering"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Robotics & Engineering</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Design and build the next generation of robots and engineering marvels.
              </p>
            </CardContent>
          </Card>

          {/* Clean Energy Solutions */}
          <Card className="overflow-hidden shadow-lg">
            <div className="h-48 overflow-hidden">
              <img
                  src="https://readdy.ai/api/search-image?query=futuristic%20blue%20circular%20energy%20reactor%20with%20concentric%20glowing%20rings%2C%20clean%20energy%20technology%20in%20a%20high-tech%20laboratory%20setting%2C%20blue%20lighting%20with%20digital%20displays%2C%20advanced%20power%20generation%20concept%20with%20holographic%20interfaces&width=400&height=250&seq=energy&orientation=landscape"
                alt="Clean Energy Solutions"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Clean Energy Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Develop sustainable energy technologies that will power our world for generations to come.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Application Section with Tabs */}
      <section id="application-section" className="py-16 px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="application" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger value="application" className="cursor-pointer data-[state=active]:bg-red-600 data-[state=active]:text-white">
                  Application Form
                </TabsTrigger>
                <TabsTrigger value="admin" className="cursor-pointer data-[state=active]:bg-red-600 data-[state=active]:text-white">
                  Admin Panel
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="application">
              <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Stark Industries Internship Application</h2>
                
                {/* Submission Response Alert */}
                {submissionResponse.show && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <AlertTitle className="text-green-700">Application Submitted!</AlertTitle>
                    <AlertDescription className="text-green-600">
                      {submissionResponse.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div>
                    <label htmlFor="areaOfInterest" className="block text-sm font-medium text-gray-700 mb-1">
                      Area of Interest
                    </label>
                    <Select
                      value={formData.areaOfInterest}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your area of interest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AI">AI & Machine Learning</SelectItem>
                        <SelectItem value="Robotics">Robotics & Engineering</SelectItem>
                        <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="Energy">Clean Energy Solutions</SelectItem>
                        <SelectItem value="Space Tech">Space Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="sop" className="block text-sm font-medium text-gray-700 mb-1">
                      Statement of Purpose
                    </label>
                    <Textarea
                      id="sop"
                      name="sop"
                      required
                      value={formData.sop}
                      onChange={handleInputChange}
                      className="w-full h-32"
                      placeholder="Tell us why you want to join Stark Industries and what you hope to accomplish..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white rounded whitespace-nowrap cursor-pointer"
                    >
                      Submit Application
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="admin">
              <div className="bg-white rounded-lg shadow-lg">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div></div>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="search"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyPress={handleSearchKeyPress}
                        className="w-64"
                      />
                      <Button 
                        onClick={handleSearch}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                      >
                        Search
                      </Button>
                      <Select
                        value={filterValue}
                        onValueChange={handleFilterChange}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by interest" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Areas</SelectItem>
                          <SelectItem value="AI">AI & ML</SelectItem>
                          <SelectItem value="Robotics">Robotics</SelectItem>
                          <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                          <SelectItem value="Energy">Energy</SelectItem>
                          <SelectItem value="Space Tech">Space Tech</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">Total Applications</p>
                      <p className="text-3xl font-bold mt-2">{stats.total}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">Artificial Intelligence</p>
                      <p className="text-3xl font-bold mt-2">{stats.ai}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">Robotics</p>
                      <p className="text-3xl font-bold mt-2">{stats.robotics}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">Cybersecurity</p>
                      <p className="text-3xl font-bold mt-2">{stats.cybersecurity}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">Energy</p>
                      <p className="text-3xl font-bold mt-2">{stats.energy}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">Space Tech</p>
                      <p className="text-3xl font-bold mt-2">{stats.spaceTech}</p>
                    </div>
                  </div>

                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <i className="fas fa-inbox text-5xl"></i>
                      </div>
                      <h3 className="text-xl font-medium text-gray-700">No applications yet</h3>
                      <p className="text-gray-500 mt-2">Applications will appear here once submitted.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Interest</TableHead>
                          <TableHead>Statement</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.fullName}</TableCell>
                            <TableCell>{app.email}</TableCell>
                            <TableCell>{getFriendlyAreaName(app.areaOfInterest)}</TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate" title={app.sop}>
                                {app.sop.length > 100 ? `${app.sop.substring(0, 100)}...` : app.sop}
                              </div>
                              <button 
                                className="text-blue-500 hover:underline text-sm"
                                onClick={() => handleViewStatement(app.id)}
                              >
                                Read More
                              </button>
                            </TableCell>
                            <TableCell>{app.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  
                  <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-2">
                      <a href="#" className="text-gray-400 hover:text-gray-600">
                        &lt;
                      </a>
                      <a href="#" className="bg-red-600 text-white h-8 w-8 flex items-center justify-center rounded-full">
                        1
                      </a>
                      <a href="#" className="text-gray-400 hover:text-gray-600">
                        &gt;
                      </a>
                    </nav>
                  </div>

                  {/* Statement Modal */}
                  <Dialog open={isStatementModalOpen} onOpenChange={setIsStatementModalOpen}>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                          Statement of Purpose
                          {currentApplication && ` - ${currentApplication.fullName}`}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                          {currentApplication && `Area of Interest: ${getFriendlyAreaName(currentApplication.areaOfInterest)}`}
                        </DialogDescription>  
                      </DialogHeader>
                      
                      <div className="my-4 max-h-96 overflow-y-auto">
                        {isLoading ? (
                          <div className="flex justify-center p-6">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-gray-800 p-4 bg-gray-50 rounded-md">
                            {fullStatement}
                          </div>
                        )}
                      </div>
                      
                      <DialogFooter>
                        <Button onClick={() => setIsStatementModalOpen(false)}>Close</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-12">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <span className="text-yellow-300 mr-2">★</span>
          STARK INDUSTRIES
        </h3>
        <p className="text-gray-400">
          Shaping tomorrow's technology today. Join us in building a better future.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
        <ul className="space-y-2 text-gray-400">
          <li className="flex items-center gap-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4" />
            200 Park Avenue, Manhattan, NY
          </li>
          <li className="flex items-center gap-2">
            <FontAwesomeIcon icon={faPhone} className="w-4" />
            +1 (212) 555-0123
          </li>
          <li className="flex items-center gap-2">
            <FontAwesomeIcon icon={faEnvelope} className="w-4" />
            careers@stark-industries.com
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-red-500 transition-colors">
            <FontAwesomeIcon icon={faLinkedin} className="text-2xl" />
          </a>
          <a href="#" className="hover:text-red-500 transition-colors">
            <FontAwesomeIcon icon={faTwitter} className="text-2xl" />
          </a>
          <a href="#" className="hover:text-red-500 transition-colors">
            <FontAwesomeIcon icon={faInstagram} className="text-2xl" />
          </a>
          <a href="#" className="hover:text-red-500 transition-colors">
            <FontAwesomeIcon icon={faFacebook} className="text-2xl" />
          </a>
        </div>
      </div>
    </div>

    <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
      <p>© 2025 Stark Industries. All rights reserved.</p>
    </div>
  </div>
</footer>
</div>
  );
};

export default App;