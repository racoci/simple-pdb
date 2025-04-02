import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-profile-selector',
  standalone: true,
  imports: [FormsModule, NgForOf],
  template: `
    <form (ngSubmit)="onSubmit()" #selectorForm="ngForm">
      <div>
        <label for="mbti">MBTI (mandatory):</label>
        <select id="mbti" [(ngModel)]="selectedMbti" name="mbti" required>
          <option *ngFor="let type of mbtiList" [value]="type">{{ type }}</option>
        </select>
      </div>

      <div>
        <label for="category">Category (optional):</label>
        <select id="category" [(ngModel)]="selectedCategory" name="category">
          <option value="">None</option>
          <option *ngFor="let cat of categoryOptions" [value]="cat.value">{{ cat.label }}</option>
        </select>
      </div>

      <button type="submit" [disabled]="!selectorForm.form.valid">Submit</button>
    </form>
  `
})
export class ProfileSelectorComponent {
  mbtiList: string[] = [
    'ISTJ', 'ESTJ', 'ISFJ', 'ESFJ', 'ESFP', 'ISFP', 'ESTP', 'ISTP',
    'INFJ', 'ENFJ', 'INFP', 'ENFP', 'INTP', 'ENTP', 'INTJ', 'ENTJ'
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

  onSubmit() {
    console.log("Selected MBTI:", this.selectedMbti);
    console.log("Selected Category:", this.selectedCategory || "None");
  }
}
