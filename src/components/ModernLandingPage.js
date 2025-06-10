import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Database, Zap, Shield, Code, Sparkles, Play, Terminal } from 'lucide-react';
import { Typewriter } from 'react-simple-typewriter';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ThemeToggle } from './theme-toggle';

const ModernLandingPage = ({ onNavigate }) => {
  const exampleQueries = [
    "Show me the top 10 customers by revenue",
    "List all orders shipped in 2024",
    "How many products are in stock?",
    "Find customers who haven't placed orders",
    "What's the average order value by month?",
    "Show me the best selling products"
  ];

  const features = [
    {
      icon: <Database className="h-6 w-6" />,
      title: "Universal Database Support",
      description: "Connect to MySQL, PostgreSQL, SQLite, and more with ease."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Get SQL queries in seconds with our advanced AI processing."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your data stays secure with enterprise-grade encryption."
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Clean SQL Output",
      description: "Generate optimized, readable SQL queries every time."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Database className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">NaturalSQL</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={() => onNavigate('demo')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Try Demo
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium mb-8"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by Advanced AI
            </motion.div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Transform Natural Language
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                into Perfect SQL
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Stop wrestling with complex SQL syntax. Just describe what you want in plain English,
              and our AI will generate the perfect query for your database.
            </p>

            {/* Interactive Demo Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <Card className="p-1 bg-card/50 backdrop-blur border-2 hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Terminal className="h-4 w-4" />
                      NaturalSQL Demo
                    </span>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm min-h-[60px] flex items-center">
                    <span className="text-muted-foreground mr-2">$ </span>
                    <span className="text-foreground">
                      <Typewriter
                        words={exampleQueries}
                        loop={0}
                        cursor
                        cursorStyle="|"
                        typeSpeed={50}
                        deleteSpeed={30}
                        delaySpeed={2000}
                      />
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Try these examples or type your own query
                    </span>
                    <Button
                      size="sm"
                      onClick={() => onNavigate('demo')}
                      className="gap-2"
                    >
                      <Play className="h-3 w-3" />
                      Try Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <Button
                size="lg"
                onClick={() => onNavigate('demo')}
                className="gap-2 h-12 px-8"
              >
                Try Demo <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('connect')}
                className="h-12 px-8"
              >
                Connect Database
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose NaturalSQL?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The most intuitive way to interact with your databases
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full text-center p-6 hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur">
                  <CardContent className="p-0">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Try our demo with sample data or connect your own database to experience
              the power of natural language SQL generation.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                onClick={() => onNavigate('demo')}
                className="gap-2 h-12 px-8"
              >
                Start Free Demo <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ModernLandingPage;
