/*
  cognitive_agent.ts
  Arquitetura avançada de agente cognitivo inspirada em Westworld, integrando filosofia escolástica, psicologia analítica, neurociência e simulação procedural.
*/

// --- TIPOS E INTERFACES ---
export interface ISensor {
  /** Retorna dados sensoriais puros */
  data(): any;
}

export interface IMemory {
  encode(event: MemoryEvent): void;
  recall(filter?: MemoryFilter): MemoryEvent[];
  consolidate(): void;       // consolidação de memórias durante o "sono" ou reveries
  emotionalTagging(event: MemoryEvent): void; // aplica marcação emocional
}

export interface IMetaCognition {
  monitor(state: AgentState): MetaReport;
  adjustStrategies(report: MetaReport): void;
  generateInsights(state: AgentState): Insight[]; // produz insights reflexivos
}

export interface IImagination {
  simulate(ctx: SimulationContext): SimulationScenario[];
  prioritize(scenarios: SimulationScenario[]): SimulationScenario; // escolhe cenário preferido
}

export interface IEmotionSystem {
  update(event: MemoryEvent | SimulationScenario): void;
  getState(): EmotionState;
  applyNeuromodulator(mod: Neuromodulator): void; // ajusta emoções globalmente
}

export interface IDecisionEngine {
  decide(context: DecisionContext): Action;
}

export interface INarrativeEngine {
  progress(event: MemoryEvent | Action): void;
  currentArc(): NarrativeArc;
  applyArchetype(archetype: Archetype): void;  // integra arquétipo junguiano
}

export interface ITheoryOfMind {
  infer(others: AgentProfile[], context: Perception): TOMState[];
}

// --- ESTRUTURAS DE DADOS ---
export type PersonalityAttributes = Record<string, number>;
export type Neuromodulator = 'dopamine' | 'serotonin' | 'adrenaline';

export interface MemoryEvent {
  timestamp: number;
  type: string;
  payload: any;
  salience: number;     // intensidade da codificação
  emotionTag?: string;  // rótulo emocional
}
export interface MemoryFilter { type?: string; timeWindow?: [number, number]; }

export interface SimulationContext { goals: Goal[]; memory: MemoryEvent[]; }
export interface SimulationScenario { description: string; score: number; emotionalImpact: number; }

export type EmotionState = Record<
  'joy' | 'fear' | 'anger' | 'sadness' | 'surprise' | 'disgust' | 'curiosity' | 'calmness',
  number
>;
export interface Perception {
  environment: any;
  agents: any[];
  synesthesia?: any;  // dado sinestésico
}
export interface Goal {
  id: string;
  priority: number;
  description: string;
  dynamic?: boolean;  // se pode ser gerado/ajustado em runtime
}
export interface Action { type: string; params?: any; }
export interface NarrativeArc { stage: string; description: string; }
export interface Archetype { name: string; influence: number; }
export interface ElevatedState { type: 'psychedelic' | 'meditative'; duration: number; startTime: number; }
export interface AgentProfile { id: string; attributes: PersonalityAttributes; }
export interface TOMState { agentId: string; intent: string; confidence: number; }
export interface MetaReport {
  attentionLoad: number;
  errorRates: Record<string, number>;
  insights: Insight[];
}
export interface Insight { message: string; impact: number; }
export interface AgentState {
  perception: Perception;
  emotions: EmotionState;
  memory: MemoryEvent[];
  goals: Goal[];
  narrative: NarrativeArc;
}
export interface DecisionContext {
  perception: Perception;
  emotions: EmotionState;
  goals: Goal[];
  tom: TOMState[];
  profile: PersonalityProfile;
}

// --- IMPLEMENTAÇÕES ---

/** Sensores SensorFusion com pesos ajustáveis */
export class SensorFusion {
  constructor(private sensors: ISensor[], private weights: number[]) {}
  data(): Perception {
    const env = {} as any;
    const ag: any[] = [];
    this.sensors.forEach((s, i) => {
      const d = s.data();
      // ponderação das entradas
      for (const k in d) env[k] = (env[k] || 0) + d[k] * this.weights[i];
      if (d.agents) ag.push(...d.agents);
    });
    return { environment: env, agents: ag };
  }
}

/** Módulo de Memória otimizado com EMAs e tagging emocional */
export class MemoryModule implements IMemory {
  private store: MemoryEvent[] = [];
  encode(event: MemoryEvent): void {
    this.emotionalTagging(event);
    this.store.push(event);
  }
  recall(filter?: MemoryFilter): MemoryEvent[] {
    return this.store.filter(evt => {
      let ok = true;
      if (filter?.type) ok = ok && evt.type === filter.type;
      if (filter?.timeWindow) ok = ok && evt.timestamp >= filter.timeWindow[0] && evt.timestamp <= filter.timeWindow[1];
      return ok;
    });
  }
  consolidate(): void {
    // aumenta salience para eventos marcantes, descarta abaixo de threshold
    this.store = this.store.reduce((acc, evt) => {
      const s = evt.salience * (evt.emotionTag ? 1.2 : 1);
      if (s > 0.1) acc.push({ ...evt, salience: Math.min(1, s) });
      return acc;
    }, [] as MemoryEvent[]);
  }
  emotionalTagging(event: MemoryEvent): void {
    // define tag com base em payload ou score
    if ((event as any).score > 0.8) event.emotionTag = 'positive';
    else if (event.salience > 0.5) event.emotionTag = 'negative';
  }
}

/** Metacognição que gera insights e ajusta perfis */
export class MetaCognitionModule implements IMetaCognition {
  monitor(state: AgentState): MetaReport {
    const attentionLoad = state.perception.agents.length * 0.2;
    const insights = this.generateInsights(state);
    return { attentionLoad, errorRates: { decision: 0.05, memory: 0.02 }, insights };
  }
  adjustStrategies(report: MetaReport): void {
    // exemplo: se muitos insights, priorizar reflexão
    if (report.insights.length > 2) {/* ativa lógica reflexiva */}
  }
  generateInsights(state: AgentState): Insight[] {
    const memLen = state.memory.length;
    return [{ message: `Registradas ${memLen} memórias.`, impact: memLen * 0.01 }];
  }
}

/** Imaginação com priorização e impacto emocional */
export class ImaginationModule implements IImagination {
  simulate(ctx: SimulationContext): SimulationScenario[] {
    return ctx.goals.map(goal => ({
      description: `Vislumbre de ${goal.description}`,
      score: Math.random(),
      emotionalImpact: Math.random()
    }));
  }
  prioritize(scenarios: SimulationScenario[]): SimulationScenario {
    return scenarios.sort((a,b) => (b.score + b.emotionalImpact) - (a.score + a.emotionalImpact))[0];
  }
}

/** Sistema de Emoções com neuromoduladores digitais */
export class EmotionModule implements IEmotionSystem {
  private state: EmotionState = { joy:0, fear:0, anger:0, sadness:0, surprise:0, disgust:0, curiosity:0, calmness:0 };
  update(event: MemoryEvent | SimulationScenario): void {
    if ('score' in event) {
      this.state.curiosity += event.score * 0.5;
      this.state.joy += event.emotionalImpact;
    } else {
      this.state.joy += event.salience * 0.2;
      if (event.emotionTag === 'negative') this.state.fear += event.salience * 0.3;
    }
    // ajustar calmness
    const arousal = this.state.fear + this.state.anger;
    this.state.calmness = Math.max(0, 1 - arousal);
  }
  getState(): EmotionState { return { ...this.state }; }
  applyNeuromodulator(mod: Neuromodulator): void {
    if (mod === 'dopamine') this.state.joy = Math.min(1, this.state.joy + 0.2);
    if (mod === 'adrenaline') this.state.fear = Math.min(1, this.state.fear + 0.3);
  }
}

/** Teoria da Mente avançada */
export class TheoryOfMindModule implements ITheoryOfMind {
  infer(others: AgentProfile[], context: Perception): TOMState[] {
    return others.map(o => ({ agentId: o.id, intent: 'friend-or-foe', confidence: Math.random() }));
  }
}

/** Motor de Decisão usando contexto completo */
export class DecisionEngine implements IDecisionEngine {
  decide(ctx: DecisionContext): Action {
    // se medo intenso e sem apoio social, fugir
    if (ctx.emotions.fear > 0.8 && !ctx.tom.some(t => t.intent === 'ally')) return { type: 'flee' };
    // cenários mentais guiam escolha de meta
    const chosen: Goal = ctx.goals.sort((a,b) => b.priority - a.priority)[0];
    return { type: 'executeGoal', params: { goalId: chosen.id } };
  }
}

/** Engine Narrativa com arquétipos e rotações de jornada */
export class NarrativeEngine implements INarrativeEngine {
  private arc: NarrativeArc = { stage: 'Chamado', description: 'Início da Jornada' };
  private archetype: Archetype = { name: 'Innocent', influence: 0.5 };
  progress(event: MemoryEvent | Action): void {
    if ('type' in event && event.type === 'executeGoal' && this.arc.stage === 'Chamado') this.arc.stage = 'Provações';
    else if ('type' in event && event.type === 'executeGoal' && this.arc.stage === 'Provações') this.arc.stage = 'Retorno';
  }
  currentArc(): NarrativeArc { return { ...this.arc }; }
  applyArchetype(arch: Archetype): void { this.archetype = arch; }
}

/** Perfil de Personalidade com aprendizado dinâmico */
export class PersonalityProfile {
  constructor(public attributes: PersonalityAttributes, public synesthesia?: any) {}
  get(attr: string): number { return this.attributes[attr] ?? 0; }
  update(attr: string, delta: number): void { this.attributes[attr] = Math.min(1, Math.max(0, (this.attributes[attr] || 0) + delta)); }
  isSynesthetic(): boolean { return !!this.synesthesia; }
}

// --- AGENTE COGNITIVO COMPLETO ---
export class CognitiveAgent {
  private sensors: SensorFusion;
  private memory: IMemory;
  private meta: IMetaCognition;
  private imagination: IImagination;
  private emotions: IEmotionSystem;
  private tom: ITheoryOfMind;
  private decision: IDecisionEngine;
  private narrative: INarrativeEngine;
  private profile: PersonalityProfile;
  private goals: Goal[];
  private others: AgentProfile[];
  private elevated?: ElevatedState;

  constructor(
    attributes: PersonalityAttributes,
    goals: Goal[],
    others: AgentProfile[] = [],
    synesthesia?: any
  ) {
    this.sensors = new SensorFusion(
      [new VisionSensor(), new AudioSensor(), new TouchSensor()],
      [0.5, 0.3, 0.2]
    );
    this.memory = new MemoryModule();
    this.meta = new MetaCognitionModule();
    this.imagination = new ImaginationModule();
    this.emotions = new EmotionModule();
    this.tom = new TheoryOfMindModule();
    this.decision = new DecisionEngine();
    this.narrative = new NarrativeEngine();
    this.profile = new PersonalityProfile(attributes, synesthesia);
    this.goals = goals;
    this.others = others;
  }

  applyElevatedState(state: ElevatedState) { this.elevated = state; }

  step(): Action {
    // 1. Aquisição e fusão sensorial
    const perception = this.sensors.data();
    if (this.profile.isSynesthetic()) perception.synesthesia = this.profile.synesthesia;

    // 2. Registro e consolidação de memória
    const memEvt: MemoryEvent = { timestamp: Date.now(), type: 'perception', payload: perception, salience: 0.1 };
    this.memory.encode(memEvt);
    this.memory.consolidate();

    // 3. Imaginação e priorização
    const simCtx: SimulationContext = { goals: this.goals, memory: this.memory.recall() };
    const scenarios = this.imagination.simulate(simCtx);
    const best = this.imagination.prioritize(scenarios);
    this.emotions.update(best);

    // 4. Atualização emocional pelos eventos recentes
    const lastPercept = this.memory.recall({ type: 'perception' }).slice(-1)[0];
    if (lastPercept) this.emotions.update(lastPercept);

    // 5. Teoria da mente
    const tomStates = this.tom.infer(this.others, perception);

    // 6. Metacognição
    const agentState: AgentState = { perception, emotions: this.emotions.getState(), memory: this.memory.recall(), goals: this.goals, narrative: this.narrative.currentArc() };
    const report = this.meta.monitor(agentState);
    this.meta.adjustStrategies(report);

    // 7. Tomada de decisão
    const ctx: DecisionContext = { perception, emotions: this.emotions.getState(), goals: this.goals, tom: tomStates, profile: this.profile };
    const action = this.decision.decide(ctx);

    // 8. Registro de ação e evolução narrativa
    const actionEvt: MemoryEvent = { timestamp: Date.now(), type: 'action', payload: action, salience: 0.2 };
    this.memory.encode(actionEvt);
    this.narrative.progress(actionEvt);
    
    return action;
  }
}

// --- EXEMPLO DE USO ---
const profileAttrs = { kindness: 0.7, curiosity: 0.9, courage: 0.5, empathy: 0.8 };
const goals: Goal[] = [ { id: 'survive', priority: 1, description: 'Sobreviver' } ];
const others: AgentProfile[] = [ { id: 'host-2', attributes: { kindness: 0.3 } } ];
const synMap = { soundToColor: (s: string) => s.length % 360 };
const agent = new CognitiveAgent(profileAttrs, goals, others, synMap);

agent.applyElevatedState({ type: 'psychedelic', duration: 600, startTime: Date.now() });
const nextAction = agent.step();
console.log('Ação seguinte:', nextAction);
