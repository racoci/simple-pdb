import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
import {NpcSimulationService} from '../npc-simulation/npc-simulation.service';


@Component({
  selector: 'app-profile-selector',
  templateUrl: 'profile-selector.component.html',
  imports: [
    FormsModule,
    NgForOf
  ],
  styles: [
    `
      form {
        display: flex;
        flex-direction: column;
        max-width: 300px;
      }

      div {
        margin-bottom: 1rem;
      }

      label {
        margin-bottom: 0.5rem;
      }
    `
  ]
})
export class ProfileSelectorComponent {
  mbtiList: string[] = [
    'ISTJ','ESTJ','ISFJ','ESFJ','ESFP','ISFP','ESTP','ISTP',
    'INFJ','ENFJ','INFP','ENFP','INTP','ENTP','INTJ','ENTJ'
  ];

  categoryOptions: { label: string, value: string }[] = [
    { label: "Pop Culture", value: "1" },
    { label: "Television", value: "2" },
    { label: "Movies", value: "3" },
    { label: "Sports", value: "5" },
    { label: "Cartoons", value: "7" },
    { label: "Anime & Manga", value: "8" },
    { label: "Comics", value: "9" },
    { label: "Noteworthy", value: "10" },
    { label: "Gaming", value: "11" },
    { label: "Literature", value: "12" },
    { label: "Theatre", value: "13" },
    { label: "Musician", value: "14" },
    { label: "Internet", value: "15" },
    { label: "The Arts", value: "16" },
    { label: "Business", value: "17" },
    { label: "Religion", value: "18" },
    { label: "Science", value: "21" },
    { label: "Historical", value: "22" },
    { label: "Web Comics", value: "26" },
    { label: "Superheroes", value: "27" },
    { label: "Philosophy", value: "28" },
    { label: "Kpop", value: "29" },
    { label: "Traits", value: "30" },
    { label: "Plots & Archetypes", value: "31" },
    { label: "Concepts", value: "32" },
    { label: "Music", value: "33" },
    { label: "Franchises", value: "34" },
    { label: "Culture", value: "35" },
    { label: "Theories", value: "36" },
    { label: "Polls (If you...)", value: "37" },
    { label: "Your Experience", value: "38" },
    { label: "Type Combo (Your Type)", value: "39" },
    { label: "Ask Pdb", value: "40" },
    { label: "PDB Community", value: "41" },
    { label: "Nature", value: "42" },
    { label: "Technology", value: "43" }
  ];

  selectedMbti: string = this.mbtiList[0];
  selectedCategory: string = "";

  constructor(
    private npcService: NpcSimulationService,
    private router: Router
  ) {}

  onSubmit() {
    // Build the query parameters.
    const queryParams: any = { mbti: this.selectedMbti };
    if (this.selectedCategory) {
      queryParams.category = this.selectedCategory;
    }

    // Navigate to the 'personality' route with the selected parameters.
    this.router.navigate(['/personality'], { queryParams });
  }

  onPersonalityChosen(selectedMbti: string, selectedCategory: string): void {
    // Add the new NPC to the simulation state
    this.npcService.addNpc(selectedMbti, selectedCategory);
    // Navigate back to the simulation view to see the new NPC in the graph
    this.router.navigate(['/npc-simulation']);
  }
}
