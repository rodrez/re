import { createContext, useContext, useState, ReactNode } from 'react';

export interface AIModel {
  id: string;
  name: string;
  provider: "openai" | "ollama";
  isAvailable: boolean;
}

export const AI_MODELS: AIModel[] = [
  // OpenAI Models
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', isAvailable: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o-mini', provider: 'openai', isAvailable: true },
  { id: 'o3-mini', name: 'O3-mini', provider: 'openai', isAvailable: true },
  
  // Ollama Models - Common models that are typically available
  { id: 'llama3.1', name: 'Llama 3.1', provider: 'ollama', isAvailable: true },
  { id: 'llama3.1-8b', name: 'Llama 3.1 8B', provider: 'ollama', isAvailable: true },
  { id: 'llama3.1-70b', name: 'Llama 3.1 70B', provider: 'ollama', isAvailable: true },
  { id: 'llama3.1-405b', name: 'Llama 3.1 405B', provider: 'ollama', isAvailable: true },
  { id: 'deepseek-r1-8b', name: 'DeepSeek R1 8B', provider: 'ollama', isAvailable: true },
  { id: 'deepseek-r1-14b', name: 'DeepSeek R1 14B', provider: 'ollama', isAvailable: true },
  { id: 'mistral', name: 'Mistral', provider: 'ollama', isAvailable: true },
  { id: 'mixtral', name: 'Mixtral', provider: 'ollama', isAvailable: true },
  { id: 'codellama', name: 'Code Llama', provider: 'ollama', isAvailable: true },
  { id: 'codellama:13b', name: 'Code Llama 13B', provider: 'ollama', isAvailable: true },
  { id: 'codellama:34b', name: 'Code Llama 34B', provider: 'ollama', isAvailable: true },
  { id: 'phi', name: 'Phi-2', provider: 'ollama', isAvailable: true },
  { id: 'neural-chat', name: 'Neural Chat', provider: 'ollama', isAvailable: true },
  { id: 'starling-lm', name: 'Starling', provider: 'ollama', isAvailable: true },
];

interface AIModelContextType {
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  models: AIModel[];
}

const AIModelContext = createContext<AIModelContextType | undefined>(undefined);

export function AIModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);

  return (
    <AIModelContext.Provider
      value={{
        selectedModel,
        setSelectedModel,
        models: AI_MODELS,
      }}
    >
      {children}
    </AIModelContext.Provider>
  );
}

export function useAIModel() {
  const context = useContext(AIModelContext);
  if (context === undefined) {
    throw new Error('useAIModel must be used within an AIModelProvider');
  }
  return context;
} 