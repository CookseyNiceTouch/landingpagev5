import { useState } from 'react'
import Hero from './components/Hero'
import FeaturesSection from './components/FeaturesSection'
import CTASection from './components/ctasection'
import './App.css'
import './components/LandingPage.css'

function App() {
  // Features data from the provided content
  const features = [
    {
      title: "Chat with your AI edit assistant to automate repetitive tasks.",
      description: "Tell it to organize your timeline, apply a rough grade, or build out a draft sequence—it responds instantly. Automate repetitive tasks",
      image: "https://placehold.co/600x400/9859A7/FFFFFF/png?text=AI+Chat+Interface",
      artboard: "AI_edit_assistant"
    },
    {
      title: "Context-Aware Workflow",
      description: "Pull in briefs, transcripts, and notes to give your AI the full picture. Nice Touch builds a contextual understanding of your project - automatically linking relevant tasks, creative direction, and client expectations.",
      image: "https://placehold.co/600x400/9859A7/FFFFFF/png?text=Context+Aware",
      artboard: "Context_Aware_Workflow"
    },
    {
      title: "File Management, Sorted",
      description: "From messy imports to ready-to-edit structures. Nice Touch builds clean, synced folder systems for your assets - based on your setup. Set your structure once, and the AI repeats it every time and flexes with your work.",
      image: "https://placehold.co/600x400/9859A7/FFFFFF/png?text=File+Management",
      artboard: "File_Management_Sorted"
    },
    {
      title: "No New Tools to Learn",
      description: "Just powerful shortcuts in the tools you already use. Nice Touch runs alongside Premiere, DaVinci, or After Effects—think of it like superpowers for your current setup.",
      image: "https://placehold.co/600x400/9859A7/FFFFFF/png?text=Existing+Tools",
      artboard: "No_New_Tools_to_Learn"
    },
    {
      title: "Error Spotting Before Export",
      description: "Last-minute glitches? We catch them first. Nice Touch scans for missing media, mismatched framerates, and common export issues.",
      image: "https://placehold.co/600x400/9859A7/FFFFFF/png?text=Error+Detection",
      artboard: "Error_Spotting_Before_Export"
    },
    {
      title: "Feedback Centralized",
      description: "Emails, links, meetings—we pull it all into one feedback stream. Every comment is linked to timecodes or files. Nothing gets missed.",
      image: "https://placehold.co/600x400/9859A7/FFFFFF/png?text=Feedback+System",
      artboard: "Feedback_Centralized"
    },
    {
      title: "Privacy & Security First",
      description: "Your work stays yours. Always. Nice Touch is built with strict data privacy in mind. Your files, feedback, and conversations are encrypted and never used to train outside models or shared without your permission.",
      image: "https://placehold.co/600x400/9859A7/FFFFFF/png?text=Privacy+%26+Security"
    }
  ];

  return (
    <div className="app">
      <Hero />
      <FeaturesSection features={features} />
      <CTASection />
    </div>
  )
}

export default App
