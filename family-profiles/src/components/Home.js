import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import heroImg from '../assets/personacart-hero.png'; // Use PNG as provided

const categories = [
  { name: "Men's Fashion", img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80' },
  { name: "Women's Fashion", img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { name: "Kids & Baby", img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
  { name: "Personal Care", img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80' },
];

const Home = ({ authToken }) => {
  const location = useLocation();
  useEffect(() => {
    if (location.state && location.state.scrollToAbout) {
      const aboutSection = document.getElementById('about-section');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PersonaCart
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                The revolutionary e-commerce platform that brings personalized shopping to every family member. 
                Create individual profiles and discover products tailored just for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/profiles"
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Create Your First Profile
                </Link>
                <Link
                  to="/products"
                  className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center"
                >
                  Browse Products
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img
                  src={heroImg}
                  alt="PersonaCart Hero"
                  className="w-full max-w-md rounded-2xl shadow-2xl"
                />
                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                  <span className="text-3xl">🛒</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose PersonaCart?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Experience shopping like never before with our innovative family profile system
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl text-white">👨‍👩‍👧‍👦</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Family Profiles
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Create individual profiles for each family member with personalized preferences, sizes, and style choices.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl text-white">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Smart Recommendations
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Get personalized product suggestions based on age, gender, size preferences, and personal care choices.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl text-white">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Secure & Private
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Each user's profiles and preferences are completely private and secure with Firebase authentication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About PersonaCart
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover the future of family shopping
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                What is PersonaCart?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                PersonaCart is an innovative e-commerce platform inspired by OTT (Over-The-Top) profile systems. 
                It allows family members to have individual shopping profiles within a single account, creating 
                a personalized shopping experience for each family member.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Just like how Netflix allows different family members to have their own viewing profiles, 
                PersonaCart enables personalized shopping experiences tailored to each family member's preferences, 
                sizes, and style choices.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Key Features</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
                  <span><strong>Family Profiles:</strong> Create individual profiles for each family member with personalized preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
                  <span><strong>Personalized Recommendations:</strong> Get product suggestions based on age, gender, size preferences, and personal care choices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
                  <span><strong>Smart Filtering:</strong> Products are automatically filtered based on profile preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
                  <span><strong>Secure Authentication:</strong> Firebase-powered login with email/password and Google sign-in</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
                  <span><strong>User Data Isolation:</strong> Each user's profiles and preferences are completely private</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg mb-16">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Create Profiles</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Add family members with their age group, gender, and preferences
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Set Preferences</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Specify shirt sizes, shoe sizes, and preferred personal care brands
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Browse Products</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Select a profile to see personalized product recommendations
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Shop Together</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Switch between profiles to shop for different family members
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-blue-900 dark:text-blue-200 mb-4 text-center">
              Technology Stack
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-center leading-relaxed">
              Built with React, Tailwind CSS, Node.js, Express, PostgreSQL (Supabase), and Firebase Authentication. 
              Features a modern, responsive design with dark mode support and real-time data management.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Family Shopping Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of families who have already discovered the joy of personalized shopping with PersonaCart.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/profiles"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Now
            </Link>
            <Link
              to="/products"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 