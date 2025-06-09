/*
  cognitive_agent.ts
  Arquitetura integrada de agente cognitivo inspirada em Westworld, filosofia escolástica e neurociência moderna.
*/

// --- TIPOS E INTERFACES ---
export interface ISensor {
  data(): any;
}

export interface IMemory {
  encode(event: MemoryEvent): void;
  recall(filter?: MemoryFilter): MemoryEvent[];
  consolidate(): void; // rotina de consolidação de memórias (sono / reveries)
}

export interface IMetaCognition {
  monitor(agentState: AgentState): MetaReport;
  adjustStrategies(report: MetaReport): void;
}

export interface IImagination {
  simulate(ctx: SimulationContext): SimulationScenario[];
}

export interface IEmotionSystem {
  update(event: MemoryEvent | SimulationScenario): void;
  getState(): EmotionState;
}

export interface IDecisionEngine {
  decide(perception: Perception, emotions: EmotionState, goals: Goal[], theoryOfMind: TOMState[]): Action;
}

export interface INarrativeEngine {
  progress(event: MemoryEvent): void;
  currentArc(): NarrativeArc;
}

export interface ITheoryOfMind {
  infer(others: AgentProfile[], perception: Perception): TOMState[];
}

// --- ESTRUTURAS DE DADOS ---
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

export type EmotionState = Record<'joy' | 'fear' | 'anger' | 'sadness' | 'surprise' | 'disgust' | 'curiosity' | 'calmness', number>;
export interface Perception { environment: any; agents: any[]; synesthesiaMap?: any; }
export interface Goal { id: string; priority: number; description: string; }
export interface Action { type: string; params?: any; }
export interface NarrativeArc { stage: string; description: string; }
export interface ElevatedState { type: 'psychedelic' | 'meditative'; duration: number; startTime: number; }
export interface AgentProfile { id: string; attributes: PersonalityAttributes; }
export interface TOMState { agentId: string; inferredIntent: string; confidence: number; }
export interface MetaReport { attentionLoad: number; errorRates: Record<string, number>; }
export interface AgentState {
  perception: Perception;
  emotions: EmotionState;
  memory: MemoryEvent[];
  goals: Goal[];
  narrative: NarrativeArc;
}

// --- IMPLEMENTAÇÕES ---

/** Sensores */
export class VisionSensor implements ISensor {
  data() { return { objects: [], lighting: {} }; }
}
export class AudioSensor implements ISensor {
  data() { return { sounds: [], volume: 0 }; }
}
export class TouchSensor implements ISensor {
  data() { return { pressureMap: [] }; }
}

/** Módulo de Memória com consolidação (Reveries) */
export class MemoryModule implements IMemory {
  private store: MemoryEvent[] = [];
  encode(event: MemoryEvent): void { this.store.push(event); }
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
  consolidate(): void {
    // Processa reveries: reforça memórias salientes e descarta ruído
    this.store = this.store.map(evt => ({ ...evt, salience: Math.min(1, evt.salience + 0.1) }));
  }
}

/** Módulo de Metacognição para autorreflexão e ajuste de estratégias */
export class MetaCognitionModule implements IMetaCognition {
  monitor(state: AgentState): MetaReport {
    const attentionLoad = state.perception.agents.length * 0.1;
    return { attentionLoad, errorRates: { decision: 0.05, memory: 0.02 } };
  }
  adjustStrategies(report: MetaReport): void {
    // Exemplo: se carga de atenção alta, reduzir detalhamento de simulações
    if (report.attentionLoad > 0.5) {
      // logic to simplify future simulations
    }
  }
}

/** Módulo de Imaginação */
export class ImaginationModule implements IImagination {
  simulate(ctx: SimulationContext): SimulationScenario[] {
    return ctx.goals.map(goal => ({ description: `Cenário: ${goal.description}`, score: Math.random() }));
  }
}

/** Sistema de Emoções com neuromoduladores digitais */
export class EmotionModule implements IEmotionSystem {
  private state: EmotionState = { joy:0, fear:0, anger:0, sadness:0, surprise:0, disgust:0, curiosity:0, calmness:0 };
  update(event: MemoryEvent | SimulationScenario): void {
    if ('score' in event) this.state.curiosity += event.score;
    else this.state.joy += event.salience * 0.2;
    // neuromodulator: ajuste global de excitação
    const arousal = this.state.fear + this.state.anger;
    this.state.calmness = Math.max(0, 1 - arousal);
  }
  getState(): EmotionState { return { ...this.state }; }
}

/** Teoria da Mente para inferir intenções alheias */
export class TheoryOfMindModule implements ITheoryOfMind {
  infer(others: AgentProfile[], perception: Perception): TOMState[] {
    return others.map(o => ({ agentId: o.id, inferredIntent: 'unknown', confidence: 0.5 }));
  }
}

/** Motor de Decisão com uso de ToM */
export class DecisionEngine implements IDecisionEngine {
  decide(perception: Perception, emotions: EmotionState, goals: Goal[], tom: TOMState[]): Action {
    if (emotions.fear > 0.7) return { type: 'flee' };
    const top = goals.sort((a,b) => b.priority - a.priority)[0];
    return { type: 'pursue', params: { goalId: top?.id } };
  }
}

/** Engine Narrativa com arquétipos e estágios do monomito */
export class NarrativeEngine implements INarrativeEngine {
  private arc: NarrativeArc = { stage: 'Chamado', description: 'Início da Jornada' };
  progress(event: MemoryEvent): void {
    if (event.type === 'action' && this.arc.stage === 'Chamado') this.arc.stage = 'Provações';
    else if (event.type === 'action' && this.arc.stage === 'Provações') this.arc.stage = 'Retorno';
  }
  currentArc(): NarrativeArc { return { ...this.arc }; }
}

/** Perfil de Personalidade e Sinestesia */
export class PersonalityProfile {
  constructor(public attributes: PersonalityAttributes, public synesthesiaMap?: any) {}
  get(attr: string): number { return this.attributes[attr] ?? 0; }
  isSynesthetic(): boolean { return !!this.synesthesiaMap; }
}

// --- AGENTE COGNITIVO INTEGRADO ---
export class CognitiveAgent {
  private sensors: ISensor[];
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
    profile: PersonalityAttributes,
    goals: Goal[],
    others: AgentProfile[] = [],
    synesthesiaMap?: any
  ) {
    this.sensors = [new VisionSensor(), new AudioSensor(), new TouchSensor()];
    this.memory = new MemoryModule();
    this.meta = new MetaCognitionModule();
    this.imagination = new ImaginationModule();
    this.emotions = new EmotionModule();
    this.tom = new TheoryOfMindModule();
    this.decision = new DecisionEngine();
    this.narrative = new NarrativeEngine();
    this.profile = new PersonalityProfile(profile, synesthesiaMap);
    this.goals = goals;
    this.others = others;
  }

  applyElevatedState(state: ElevatedState) { this.elevated = state; }

  step(): Action {
    // 1. Percepção e sinestesia opcional
    let perception: Perception = this.sensors.reduce((env, s) => ({ ...env, ...s.data() }), { environment: {}, agents: [] });
    if (this.profile.isSynesthetic()) {
      perception.synesthesiaMap = this.profile.synesthesiaMap;
    }

    // 2. Registrar percepção
    this.memory.encode({ timestamp: Date.now(), type: 'perception', payload: perception, salience: 0.1 });

    // 3. Consolidar memórias (reveries)
    this.memory.consolidate();

    // 4. Imaginação gera cenários
    const simCtx: SimulationContext = { goals: this.goals, memory: this.memory.recall() };
    const scenarios = this.imagination.simulate(simCtx);
    scenarios.forEach(s => this.emotions.update(s));

    // 5. Atualizar emoções pela última memória
    const lastMem = this.memory.recall({ type: 'perception' }).pop();
    if (lastMem) this.emotions.update(lastMem);

    // 6. Inferir estados mentais de outros (ToM)
    const tomStates = this.tom.infer(this.others, perception);

    // 7. Metacognição e ajuste
    const agentState: AgentState = {
      perception, emotions: this.emotions.getState(), memory: this.memory.recall(), goals: this.goals, narrative: this.narrative.currentArc()
    };
    const report = this.meta.monitor(agentState);
    this.meta.adjustStrategies(report);

    // 8. Decisão baseada em percepção, emoções, metas e ToM
    const action = this.decision.decide(perception, this.emotions.getState(), this.goals, tomStates);

    // 9. Registrar ação e evoluir narrativa
    this.memory.encode({ timestamp: Date.now(), type: 'action', payload: action, salience: 0.2 });
    this.narrative.progress({ timestamp: Date.now(), type: 'action', payload: action, salience: 0.2 });

    return action;
  }
}

// --- EXEMPLO DE USO ---
const profile = { kindness: 0.7, curiosity: 0.9, courage: 0.5, empathy: 0.8 };
const goals: Goal[] = [ { id: 'survive', priority: 1, description: 'Sobreviver' } ];
const others: AgentProfile[] = [ { id: 'host-2', attributes: { kindness:0.3 } } ];
const synMap = { soundToColor: (s:string)=> s.length % 360 };
const agent = new CognitiveAgent(profile, goals, others, synMap);

agent.applyElevatedState({ type: 'meditative', duration: 300, startTime: Date.now() });
const next = agent.step();
console.log('Ação seguinte:', next);
