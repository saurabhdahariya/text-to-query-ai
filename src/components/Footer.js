import React from "react";
import { Database, Github, Twitter, Mail } from "lucide-react";

const Footer = () => (
  <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-24">
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">NaturalSQL</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Transform natural language into SQL queries with the power of AI.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
            <li><a href="#demo" className="hover:text-foreground transition-colors">Demo</a></li>
            <li><a href="#docs" className="hover:text-foreground transition-colors">Documentation</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#help" className="hover:text-foreground transition-colors">Help Center</a></li>
            <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
            <li><a href="#status" className="hover:text-foreground transition-colors">Status</a></li>
            <li><a href="#privacy" className="hover:text-foreground transition-colors">Privacy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-4">Connect</h4>
          <div className="flex gap-3">
            <a href="https://github.com" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors" aria-label="GitHub">
              <Github className="h-4 w-4 text-muted-foreground" />
            </a>
            <a href="https://twitter.com" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors" aria-label="Twitter">
              <Twitter className="h-4 w-4 text-muted-foreground" />
            </a>
            <a href="mailto:contact@naturalsql.com" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors" aria-label="Email">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} NaturalSQL. Built with ❤️ for developers and data analysts.
      </div>
    </div>
  </footer>
);

export default Footer;