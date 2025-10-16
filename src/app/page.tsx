"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HardHat,
  Home,
  Hammer,
  Users,
  Award,
  Mail,
  Phone,
  MapPin,
  Star,
  ChevronRight,
  Menu,
  X,
  ChevronDown,
  Earth,
  Car,
  Shovel
} from "lucide-react";
import { Target, Briefcase, Shield } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

const ConstructionLandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoaded, isSignedIn } = useUser();

  // Services data
  const services = [
    {
      icon: <HardHat className="h-10 w-10 text-blue-500" />,
      title: "General Contractor",
      description: "Comprehensive construction services from planning to completion."
    },
    {
      icon: <Earth className="h-10 w-10 text-blue-500" />,
      title: "Earthwork",
      description: "Excavation, grading, and site preparation services for any project."
    },
    {
      icon: <Car className="h-10 w-10 text-blue-500" />,
      title: "Equipment Rent",
      description: "Wide range of construction equipment available for short or long-term rental."
    },
    {
      icon: <Shovel className="h-10 w-10 text-blue-500" />,
      title: "Mining Contractor",
      description: "Specialized mining services with experienced professionals and proper equipment."
    }
  ];

  // Projects data
  const projects = [
    {
      title: "Modern Office Complex",
      description: "20-story commercial building with sustainable features",
      image: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Luxury Residential",
      description: "Custom home with premium finishes and smart technology",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Retail Center",
      description: "Mixed-use development with shopping and dining",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      content: "Professional, reliable, and delivered beyond our expectations. Our new home is everything we dreamed of!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Business Owner",
      content: "The team transformed our retail space efficiently and with minimal disruption to our business.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Property Developer",
      content: "Excellent project management and quality craftsmanship. Will definitely work with them again.",
      rating: 5
    }
  ];

  // Core Values data
  const coreValues = [
    {
      icon: <Target className="h-10 w-10 text-blue-500" />,
      title: "Focus",
      description: "We maintain unwavering focus on project objectives, delivering exceptional results with precision and dedication to every detail."
    },
    {
      icon: <Briefcase className="h-10 w-10 text-blue-500" />,
      title: "Professional",
      description: "Our team operates with the highest professional standards, ensuring quality workmanship and reliable project management."
    },
    {
      icon: <Shield className="h-10 w-10 text-blue-500" />,
      title: "Integrity",
      description: "We conduct business with transparency and honesty, building trust through ethical practices and accountable leadership."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur" role="banner">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image 
              src="/lma.png" 
              alt="LMA Logo" 
              width={32} 
              height={32} 
              className="h-8 w-8"
              aria-hidden="true" 
            />
            <Link href="/" className="flex items-center gap-2 font-bold text-xl" aria-label="LMA 1B HOME">
              {/* <span>Project 1B</span> */}
            </Link>
          </div>

          {/* Desktop Navigation - Centered at top level */}
          <nav className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2" aria-label="Main navigation">
            <div className="flex items-center gap-8 text-sm font-medium">
              <Link href="#main-content" className="hover:text-blue-500 transition-colors sr-only focus:not-sr-only focus:absolute focus:bg-white focus:text-black focus:p-2 focus:left-4 focus:top-16">
                Skip to main content
              </Link>
              <Link href="#main-content" className="hover:text-blue-500 transition-colors">Home</Link>
              <Link href="#services" className="hover:text-blue-500 transition-colors">Services</Link>
              {/* <Link href="#core-values" className="hover:text-blue-500 transition-colors">Core Values</Link> */}
              <Link href="#projects" className="hover:text-blue-500 transition-colors">Projects</Link>
              <Link href="#about" className="hover:text-blue-500 transition-colors">About</Link>
              <Link href="#contact" className="hover:text-blue-500 transition-colors">Contact</Link>
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isLoaded && isSignedIn && (
              <div className="hidden md:block">
                <UserButton afterSignOutUrl="/" />
              </div>
            )}
            <Link href="/dashboard">
              <Button variant="outline" size="sm" aria-label="Dashboard">
                Dashboard
              </Button>
            </Link>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" aria-label="Close menu" /> : <Menu className="h-5 w-5" aria-label="Open menu" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t bg-background py-4 px-4" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <div className="flex flex-col gap-4">
              <Link href="#main-content" className="hover:text-blue-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="#services" className="hover:text-blue-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>Services</Link>
              <Link href="#core-values" className="hover:text-blue-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>Core Values</Link>
              <Link href="#projects" className="hover:text-blue-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
              <Link href="#about" className="hover:text-blue-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link href="#contact" className="hover:text-blue-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:text-black focus:p-2 focus:z-50">
          Skip to main content
        </a>
        
        {/* Hero Section */}
        <section id="main-content" className="relative py-50">
          <div className="absolute inset-0 z-0">
            <Image
              src="/landing.jpg"
              alt="Lancarjaya Mandiri Abadi Construction"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          <div className="container px-4 mx-auto relative z-10">
            <div className="flex flex-col items-center text-center text-white">
              <Badge className="mb-4 bg-blue-500 text-white">EST. 1994</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-3xl">
                PT.Lancarjaya Mandiri Abadi
              </h1>
              <p className="text-2xl mb-10 font-bold max-w-2xl">
                Project 1B
              </p>
              
              {/* Stats Section */}
              {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 w-full max-w-4xl">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">250+</div>
                  <div className="text-sm md:text-base text-blue-200">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">15+</div>
                  <div className="text-sm md:text-base text-blue-200">Years</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">98%</div>
                  <div className="text-sm md:text-base text-blue-200">Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">50+</div>
                  <div className="text-sm md:text-base text-blue-200">Team Members</div>
                </div>
              </div> */}
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white">
                  Get Free Quote <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-black">
                  View Projects
                </Button> */}
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="container px-4 mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">About PT.Lancarjaya Mandiri Abadi</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    PT Lancarjaya Mandiri Abadi (LMA) is a premier general contractor in Indonesia, renowned for exceptional and timely service. 
                    As a trusted partner for both government and private clients, we are executing an aggressive expansion strategy, backed by our expert team.
                    Our core capabilities span from earthworks and mining construction to transportation.
                  </p>
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-blue-500">50+</div>
                      <div className="text-muted-foreground">Projects Completed</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-blue-500">30+</div>
                      <div className="text-muted-foreground">Years Experience</div>
                    </div>
                  </div>
                  <a href="https://lmacontractor.com" target="_blank" rel="noopener noreferrer">
                    <Button size="lg">
                      Learn More About Us
                    </Button>
                  </a>
                </div>
                <div className="lg:w-1/2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-6 h-64 flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                        alt="Construction site" 
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <div className="bg-muted rounded-lg p-6 h-64 flex items-center justify-center mt-8">
                      <img 
                        src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                        alt="Construction team" 
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <div className="bg-muted rounded-lg p-6 h-64 flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                        alt="Construction detail" 
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <div className="bg-muted rounded-lg p-6 h-64 flex items-center justify-center mt-8">
                      <img 
                        src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                        alt="Construction equipment" 
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section id="core-values" className="py-20 bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide our business and define our commitment to excellence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {coreValues.map((value, index) => (
                <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md text-center">
                  <div className="mb-6 flex justify-center items-center w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950/30 mx-auto">
                    {value.icon}
                  </div>
                  <CardHeader className="p-0">
                    <CardTitle className="text-2xl mb-4">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-20">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our portfolio of completed construction projects
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {projects.map((project, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={`Photo of ${project.title}`} 
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <Button className="w-full bg-white text-black hover:bg-gray-200" aria-label={`View details for ${project.title}`}>
                        View Details
                      </Button>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20  bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive construction solutions tailored to your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {services.map((service, index) => (
                <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md">
                  <div className="mb-4 flex justify-center items-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/30 mx-auto">
                    {service.icon}
                  </div>
                  <CardHeader className="p-0 text-center">
                    <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 text-center">
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {/* <section className="py-20 bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Client Testimonials</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                What our clients say about our construction services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6 bg-background border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="relative">
                    <svg className="absolute top-0 left-0 h-8 w-8 text-blue-200 -translate-x-2 -translate-y-1" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"/>
                    </svg>
                    <p className="text-muted-foreground mb-6 italic pl-6">&quot;{testimonial.content}&quot;</p>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section> */}

        {/* Contact Section */}
        <section id="contact" className="py-20">
          <div className="container px-4 mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Get in touch with our team
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Get In Touch</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">Phone</h4>
                        <p className="text-muted-foreground">(021) 8250-365</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Mail className="h-6 w-6 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">Email</h4>
                        <p className="text-muted-foreground">business.process@lmacontractor.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">Address</h4>
                        <p className="text-muted-foreground">
                          Jl. Raya Narogong, Cileungsi, Jawa Barat, Indonesia</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  <h4 className="text-xl font-bold mb-4">Business Hours</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday - Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Send us a message</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" placeholder="John" />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" placeholder="Doe" />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="john@example.com" />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" placeholder="(555) 123-4567" />
                        </div>
                        
                        {/* <div>
                          <Label htmlFor="service">Service Needed</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Label className="flex items-center gap-2">
                              <Input type="checkbox" />
                              <span>General Contractor</span>
                            </Label>
                            <Label className="flex items-center gap-2">
                              <Input type="checkbox" />
                              <span>Earthwork</span>
                            </Label>
                            <Label className="flex items-center gap-2">
                              <Input type="checkbox" />
                              <span>Heavy Equipment Rental</span>
                            </Label>
                            <Label className="flex items-center gap-2">
                              <Input type="checkbox" />
                              <span>Mining Contractor</span>
                            </Label>
                          </div>
                        </div> */}
                        
                        <div>
                          <Label htmlFor="message">Message</Label>
                          <Textarea id="message" placeholder="Tell us about your project..." rows={4} />
                        </div>
                        
                        <Button className="w-full" type="submit">
                          Send Message
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-gray-900 text-white py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <Image 
                  src="/lma.png" 
                  alt="LMA Logo" 
                  width={20} 
                  height={20} 
                  className="h-8 w-8 text-blue-400"
                />
                <span className="text-lg font-semibold">PT.Lancarjaya Mandiri Abadi</span>
              </div>
                <p className="text-blue-200 mb-4">
                  Professional construction services with over 30 years of experience.
                </p>
                <div className="flex gap-4 justify-center md:justify-start">
                  <Link href="https://www.facebook.com/ptlma/" className="text-blue-200 hover:text-white">
                    <span className="sr-only">Facebook</span>
                    <div className="h-8 w-8 rounded-full border border-blue-500 flex items-center justify-center">
                      <span className="text-xs">f</span>
                    </div>
                  </Link>
                  <Link href="https://www.instagram.com/ptlma_id/" className="text-blue-200 hover:text-white">
                    <span className="sr-only">Instagram</span>
                    <div className="h-8 w-8 rounded-full border border-blue-500 flex items-center justify-center">
                      <span className="text-xs">ig</span>
                    </div>
                  </Link>
                  <Link href="https://www.linkedin.com/company/pt-lancarjaya-mandiri-abadi-id/" className="text-blue-200 hover:text-white">
                    <span className="sr-only">LinkedIn</span>
                    <div className="h-8 w-8 rounded-full border border-blue-500 flex items-center justify-center">
                      <span className="text-xs">in</span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold mb-4">Services</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-blue-200 hover:text-white">General Contractor</Link></li>
                  <li><Link href="#" className="text-blue-200 hover:text-white">Earthwork</Link></li>
                  <li><Link href="#" className="text-blue-200 hover:text-white">Heavy Equipment Rental</Link></li>
                  <li><Link href="#" className="text-blue-200 hover:text-white">Mining Contractor</Link></li>
                </ul>
              </div>

              <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="#about" className="text-blue-200 hover:text-white">About Us</Link></li>
                  <li><Link href="#projects" className="text-blue-200 hover:text-white">Projects</Link></li>
                  <li><Link href="https://id.jobstreet.com/id/companies/lancarjaya-mandiri-abadi-168557984861565" className="text-blue-200 hover:text-white">Careers</Link></li>
                  <li><Link href="https://lmacontractor.com" className="text-blue-200 hover:text-white">Blog</Link></li>
                </ul>
              </div>

              <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <address className="not-italic text-blue-200">
                  <div className="mb-2">Jl. Raya Narogong, Cileungsi, Jawa Barat</div>
                  <div className="mb-2">Indonesia</div>
                  <div className="mb-2">(021) 8250-365</div>
                  <div>business.process@lmacontractor.com</div>
                </address>
              </div>
            </div>

            <Separator className="my-8 bg-blue-800" />

            <div className="text-center text-sm text-blue-300">
              {/* © {new Date().getFullYear()} PT.Lancarjaya Mandiri Abadi. All rights reserved. */}
              Made With ❤ by PT.Lancarjaya Mandiri Abadi
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ConstructionLandingPage;