'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Context7Manager, Context7, ContextAnalysisResult } from './context-manager';

interface Context7ContextType {
  contextManager: Context7Manager;
  currentContext: Context7 | null;
  analysisResult: ContextAnalysisResult | null;
  isAnalyzing: boolean;
  analyzeCurrentPosition: (filePath: string, position: { line: number; column: number }) => Promise<void>;
  clearContext: () => void;
  getContextSuggestions: () => string[];
}

const Context7Context = createContext<Context7ContextType | null>(null);

interface Context7ProviderProps {
  children: ReactNode;
}

export function Context7Provider({ children }: Context7ProviderProps) {
  const [contextManager] = useState(() => new Context7Manager());
  const [currentContext, setCurrentContext] = useState<Context7 | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ContextAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCurrentPosition = async (filePath: string, position: { line: number; column: number }) => {
    setIsAnalyzing(true);
    try {
      const context = await contextManager.analyzeContext(filePath, position);
      const result = await contextManager.generateSuggestions(context);
      
      setCurrentContext(context);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing context:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearContext = () => {
    setCurrentContext(null);
    setAnalysisResult(null);
    contextManager.clearCache();
  };

  const getContextSuggestions = (): string[] => {
    if (!analysisResult) return [];
    return [
      ...analysisResult.suggestions,
      ...analysisResult.optimizations
    ];
  };

  const contextValue: Context7ContextType = {
    contextManager,
    currentContext,
    analysisResult,
    isAnalyzing,
    analyzeCurrentPosition,
    clearContext,
    getContextSuggestions
  };

  return (
    <Context7Context.Provider value={contextValue}>
      {children}
    </Context7Context.Provider>
  );
}

export function useContext7(): Context7ContextType {
  const context = useContext(Context7Context);
  if (!context) {
    throw new Error('useContext7 must be used within a Context7Provider');
  }
  return context;
}

export function Context7Debug() {
  const { currentContext, analysisResult, isAnalyzing } = useContext7();

  if (!currentContext && !isAnalyzing) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border rounded-lg p-4 max-w-md shadow-lg">
      <h3 className="font-semibold mb-2">Context 7 Analysis</h3>
      
      {isAnalyzing && (
        <div className="text-sm text-gray-600">Analyzing context...</div>
      )}
      
      {currentContext && (
        <div className="text-sm space-y-2">
          <div>
            <strong>File:</strong> {currentContext.currentFile.filePath.split('/').pop()}
          </div>
          <div>
            <strong>Function:</strong> {currentContext.currentFunction.functionName || 'Unknown'}
          </div>
          <div>
            <strong>Patterns:</strong> {currentContext.architecturePatterns.patterns.join(', ')}
          </div>
          <div>
            <strong>Dependencies:</strong> {currentContext.currentFile.dependencies.length}
          </div>
        </div>
      )}
      
      {analysisResult && (
        <div className="mt-3 text-sm">
          <div className="text-green-600">
            <strong>Suggestions:</strong> {analysisResult.suggestions.length}
          </div>
          <div className="text-yellow-600">
            <strong>Warnings:</strong> {analysisResult.warnings.length}
          </div>
          <div className="text-blue-600">
            <strong>Optimizations:</strong> {analysisResult.optimizations.length}
          </div>
        </div>
      )}
    </div>
  );
}