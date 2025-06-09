/*
  cognitive-agent.ts
  Arquitetura integrada de agente cognitivo inspirada em Westworld, filosofia e neurociência.
*/

// --- Definições de tipos e interfaces ---
export interface ISensor {
  data(): any;
}

export interface IMemory {
  encode(event: MemoryEvent): void;
  recall(filter?: MemoryFilter): MemoryEvent[];
}

export interface IMagination {
  simulate(context: SimulationContext): SimulationScenario[];
}

export interface IEmotionSystem {
  update(event: MemoryEvent | SimulationScenario): void;
  getState(): EmotionState;
}

export interface IDecisionEngine {
  decide(perception: Perception, emotions: EmotionState, goals: Goal[]): Action;
}

export interface INarrativeEngine {
  progress(event: MemoryEvent): void;
  currentArc(): NarrativeArc;
}

// --- Estruturas de dados ---
export type PersonalityAttributes = Record<string, number>;

export interface MemoryEvent {
  timestamp: number;
  type: string;
  payload: any;
  salience: number;
}
export interface MemoryFilter { type?: string; timeWindow?: [number, number]; }

export interface SimulationContext { goals: Goal[]; memory: MemoryEvent[]; }
export interface SimulationScenario { description: string; score: number; }

export type EmotionState = Record<'joy' | 'fear' | 'anger' | 'sadness' | 'surprise' | 'disgust' | 'curiosity', number>;

export interface Perception { environment: any; agents: any[]; }
export interface Goal { id: string; priority: number; description: string; }
export interface Action { type: string; params?: any; }

export interface NarrativeArc { stage: string; description: string; }

// --- Implementações básicas ---

/** Sensores de exemplo */
export class VisionSensor implements ISensor {
  data() { /* retorna quadro de visão */ return {}; }
}
export class AudioSensor implements ISensor {
  data() { /* retorna amostra de áudio */ return {}; }
}

/** Módulo de Memória */
export class MemoryModule implements IMemory {
  private store: MemoryEvent[] = [];
  encode(event: MemoryEvent): void {
    this.store.push(event);
  }
  recall(filter?: MemoryFilter): MemoryEvent[] {
    return this.store.filter(evt => {
      let ok = true;
      if (filter?.type) ok = ok && evt.type === filter.type;
      if (filter?.timeWindow) {
        ok = ok && evt.timestamp >= filter.timeWindow[0] && evt.timestamp <= filter.timeWindow[1];
      }
      return ok;
    });
  }
}

/** Módulo de Imaginação */
export class ImaginationModule implements IMagination {
  simulate(ctx: SimulationContext): SimulationScenario[] {
    // combina memórias e metas para gerar cenários
    return ctx.goals.map(goal => ({ description: `Simulação de ${goal.description}`, score: Math.random() }));
  }
}

/** Sistema de Emoções */
export class EmotionModule implements IEmotionSystem {
  private state: EmotionState = { joy:0, fear:0, anger:0, sadness:0, surprise:0, disgust:0, curiosity:0 };
  update(event: MemoryEvent | SimulationScenario): void {
    // ajuste simplificado: aumenta curiosidade em novos cenários
    if ('score' in event) this.state.curiosity += event.score;
    else this.state.joy += event.salience * 0.1;
  }
  getState(): EmotionState { return { ...this.state }; }
}

/** Motor de Decisão */
export class DecisionEngine implements IDecisionEngine {
  decide(perception: Perception, emotions: EmotionState, goals: Goal[]): Action {
    // Exemplo: se medo alto, fugir;
    if (emotions.fear > 0.5) return { type: 'flee', params: {} };
    // senão, seguir o maior objetivo
    const top = goals.sort((a,b) => b.priority - a.priority)[0];
    return { type: 'pursue_goal', params: { goalId: top?.id } };
  }
}

/** Motor Narrativo */
export class NarrativeEngine implements INarrativeEngine {
  private arc: NarrativeArc = { stage: 'Call to Adventure', description: 'Início da jornada' };
  progress(event: MemoryEvent): void {
    // Simplificação de avanço de estágio
    if (event.type === 'challenge') this.arc.stage = 'Trials';
  }
  currentArc(): NarrativeArc { return { ...this.arc }; }
}

/** Perfil de Personalidade */
export class PersonalityProfile {
  constructor(public attributes: PersonalityAttributes) {}
  get(attr: string): number { return this.attributes[attr] ?? 0; }
}

// --- Agente Cognitivo Integrado ---
export class CognitiveAgent {
  // componentes
  private sensors: ISensor[];
  private memory: IMemory;
  private imagination: IMagination;
  private emotions: IEmotionSystem;
  private decision: IDecisionEngine;
  private narrative: INarrativeEngine;
  private profile: PersonalityProfile;
  private goals: Goal[];

  constructor(profile: PersonalityAttributes, initialGoals: Goal[]) {
    this.sensors = [ new VisionSensor(), new AudioSensor() ];
    this.memory = new MemoryModule();
    this.imagination = new ImaginationModule();
    this.emotions = new EmotionModule();
    this.decision = new DecisionEngine();
    this.narrative = new NarrativeEngine();
    this.profile = new PersonalityProfile(profile);
    this.goals = initialGoals;
  }

  step(): Action {
    // 1. Percepção
    const perception: Perception = {
      environment: this.sensors.reduce((env, s) => ({ ...env, ...s.data() }), {}),
      agents: []
    };
    // 2. Encode percepção como memória
    this.memory.encode({ timestamp: Date.now(), type: 'perception', payload: perception, salience: 0.1 });

    // 3. Imaginação gera cenários
    const simCtx: SimulationContext = { goals: this.goals, memory: this.memory.recall() };
    const scenarios = this.imagination.simulate(simCtx);
    scenarios.forEach(s => this.emotions.update(s));

    // 4. Atualizar emoções a partir da última percepção
    const lastMem = this.memory.recall({ type: 'perception' }).slice(-1)[0];
    if (lastMem) this.emotions.update(lastMem);

    // 5. Decisão
    const action = this.decision.decide(perception, this.emotions.getState(), this.goals);

    // 6. Registrar ação em memória e narrativa
    this.memory.encode({ timestamp: Date.now(), type: 'action', payload: action, salience: 0.2 });
    this.narrative.progress({ timestamp: Date.now(), type: 'action', payload: action, salience: 0.2 });

    return action;
  }
}

// --- Exemplo de uso ---
const profile: PersonalityAttributes = { kindness: 0.7, curiosity: 0.9, courage: 0.5, empathy: 0.8 };
const goals: Goal[] = [ { id: 'survive', priority: 1, description: 'Sobreviver' } ];
const agent = new CognitiveAgent(profile, goals);

// Executar um ciclo de decisão
const nextAction = agent.step();
console.log('Próxima ação:', nextAction);
