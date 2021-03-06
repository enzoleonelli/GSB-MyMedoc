import { Component } from '@angular/core';
import { Ordonnance, Medoc } from '../interfaces';
import { GsbMainService } from '../gsb-main.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page {

  // TODO: Add an edit page for ordonnance

  currentStep: string = "main"
  selectedOrdonnance: Ordonnance
  selectedMedoc: Medoc
  formMedocList: Medoc[] = []
  formInternalId = 0
  formEditMedoc: boolean = false
  formSelectedMedoc: Medoc
  formSelectedMedocColor: string
  formSelectedMedocIndex: number
  formSavedOrdonnance: any
  creationOrdonnance: boolean


  constructor(private gsbMainService: GsbMainService) {
    this.gsbMainService.init();
  }


  public checkStep(step: string) {
    return step === this.currentStep
  }

  public changeStepTo(step: string) {
    this.currentStep = step;
  }


  public refreshList(refresher: any) {
    // this.updatePrisesList()
    // this.updateEventListFromPrisesList()
    // setTimeout(() => {
    //   refresher.detail.complete()
    // }, 1500);
    this.gsbMainService.loadData()
    .then(() => {
      refresher.detail.complete()
    })
  }


  public selectOrdonnance(id: number) {

    for (let index = 0; index < this.gsbMainService.data.ordonnances.length; index++) {
      const ordonnance = this.gsbMainService.data.ordonnances[index];
      if (ordonnance.id === id) {
        this.selectedOrdonnance = ordonnance
        // console.log("this.selectedOrdonnance : ", this.selectedOrdonnance)
      }
    }

    if (this.selectedOrdonnance == undefined) {

      this.gsbMainService.alertInfo("Erreur : ", "Il semblerait que cette ordonnance n'existe pas ...")

    } else {

      this.currentStep = "ordonnance-details"

    }

  }


  public selectMedoc(id: number) {

    for (let index = 0; index < this.gsbMainService.data.ordonnances.length; index++) {
      const ordonnance: Ordonnance = this.gsbMainService.data.ordonnances[index];
      for (let index2 = 0; index2 < ordonnance.medocs.length; index2++) {
        const medoc: Medoc = ordonnance.medocs[index2];
        if (medoc.id === id) {
          this.selectedMedoc = medoc
        }
      }
    }

    if (this.selectedOrdonnance == undefined) {
      this.gsbMainService.alertInfo("Erreur : ", "Il semblerait que ce médicament n'existe pas ...")
    } else {
      this.currentStep = "medoc-details"
    }

  }


  public startAddOrdonnance() {
    this.formSavedOrdonnance = {
      titre: "",
      description: "",
      dateDebut: "",
      dateFin: ""
    }
    this.formMedocList = []
    this.currentStep = "ordonnance-add"
    this.creationOrdonnance = true
  }

  public addOrdonnance(form: any) {

    try {

      // console.log(form.form.value)

      this.formMedocList.forEach((medoc: Medoc) => {
        medoc.id = GsbMainService.generateId()
      });

      const formedOrdonnance =
      {
        id: GsbMainService.generateId(),
        titre: form.form.value.titre,
        description: form.form.value.description,
        dateDebut: form.form.value.dateDebut,
        dateFin: form.form.value.dateFin,
        medocs: this.formMedocList
      }

      // console.log("Adding Ordonnance : ", formedOrdonnance)

      // this.gsbMainService.data.ordonnances.push(formedOrdonnance)
      this.gsbMainService.addOrdonnance(formedOrdonnance)

      form.reset();
      this.formMedocList = []
      this.changeStepTo('main');

    }
    catch (err) {
      console.error(err)
      this.gsbMainService.alertInfo("Erreur", `Une erreur s'est produite : ${err}`)
    }

  }


  public startModifOrdonnance() {
    // console.log('starting modif')
    this.changeStepTo("ordonnance-modif") 
    this.formSavedOrdonnance = this.selectedOrdonnance
    this.formMedocList = this.selectedOrdonnance.medocs
    this.creationOrdonnance = false 
  }

  public modifOrdonnance(form: any) {
    console.log("modif :", form)

    try {

      // console.log(form.form.value)

      this.formMedocList.forEach((medoc: Medoc) => {
        medoc.id = GsbMainService.generateId()
      });

      const formedOrdonnance: Ordonnance =
      {
        id: this.selectedOrdonnance.id,
        titre: form.form.value.titre,
        description: form.form.value.description,
        dateDebut: form.form.value.dateDebut,
        dateFin: form.form.value.dateFin,
        medocs: this.formMedocList
      }

      this.selectedOrdonnance = formedOrdonnance

      // console.log("Adding Ordonnance : ", formedOrdonnance)

      // this.gsbMainService.data.ordonnances.push(formedOrdonnance)
      this.gsbMainService.modifyOrdonnance(formedOrdonnance)

      form.reset();
      this.formMedocList = []
      
      this.changeStepTo("ordonnance-details")

    }
    catch (err) {
      console.error(err)
      this.gsbMainService.alertInfo("Erreur", `Une erreur s'est produite : ${err}`)
    }

  }

  public async supprimerOrdonnance() {
    // console.log("MAIS VA TE FAIRE FOUTRE")
    if (await this.gsbMainService.alertAreYouSure(`Etes-vous sûr de vouloir supprimer l'ordonnance "${this.selectedOrdonnance.titre}" ?`)) {
      this.gsbMainService.removeOrdonnance(this.selectedOrdonnance)
      this.changeStepTo("main")
    }
  }

  public startAddMedoc(form: any) {

    this.formSavedOrdonnance = {
      titre: form.form.value.titre,
      description: form.form.value.description,
      dateDebut: form.form.value.dateDebut,
      dateFin: form.form.value.dateFin
    }

    this.formSelectedMedocColor = undefined

    this.currentStep = "medoc-add"

  }

  public addMedoc(form: any) {

    try {
      // console.log(form.form.value)

      const formedMedoc: Medoc =
      {
        id: this.formInternalId,
        nom: form.form.value.nom,
        nbBoiteMax: form.form.value.nbBoiteMax,
        nbBoiteAchetees: form.form.value.nbBoiteAchetees,
        nbMedocParBoite: form.form.value.nbMedocParBoite,
        nbFoisParJour: form.form.value.nbFoisParJour,
        nbFoisParSemaine: form.form.value.nbFoisParSemaine,
        finDeLaPrise: form.form.value.finDeLaPrise,
        couleur: this.formSelectedMedocColor,
        prises: []
      }

      this.formMedocList.push(formedMedoc)

      this.formInternalId++;

      form.reset();
      // this.changeStepTo('ordonnance-add');
      if (this.creationOrdonnance) {
        this.changeStepTo('ordonnance-add');
      }
      else {
        this.changeStepTo('ordonnance-modif')
      }

    }
    catch (err) {
      console.error(err)
      this.gsbMainService.alertInfo("Erreur", `Une erreur s'est produite : ${err}`)
    }

  }

  public selectFormColor(color: string) {
    this.formSelectedMedocColor = color
  }


  public startEditMedoc(id: number, form: any, returnToOrdoCrea: boolean) {

    this.creationOrdonnance = returnToOrdoCrea

    this.formSavedOrdonnance = {
      titre: form.form.value.titre,
      description: form.form.value.description,
      dateDebut: form.form.value.dateDebut,
      dateFin: form.form.value.dateFin
    }

    for (let index = 0; index < this.formMedocList.length; index++) {
      const medoc = this.formMedocList[index];
      if (medoc.id === id) {
        this.formSelectedMedoc = medoc
        this.formSelectedMedocIndex = index
      }
    }

    if (this.formSelectedMedoc == undefined) {
      this.gsbMainService.alertInfo("Erreur : ", "Il semblerait que cette ordonnance n'existe pas ...")
    } else {
      this.currentStep = "medoc-edit"
    }

    this.formSelectedMedocColor = this.formSelectedMedoc.couleur

  }

  public editMedoc(form: any) {

    try {

      const formedMedoc: Medoc =
      {
        id: this.formInternalId,
        nom: form.form.value.nom,
        nbBoiteMax: form.form.value.nbBoiteMax,
        nbBoiteAchetees: form.form.value.nbBoiteAchetees,
        nbMedocParBoite: form.form.value.nbMedocParBoite,
        nbFoisParJour: form.form.value.nbFoisParJour,
        nbFoisParSemaine: form.form.value.nbFoisParSemaine,
        couleur: this.formSelectedMedocColor,
        finDeLaPrise: new Date(),
        prises: []
      }

      this.formMedocList[this.formSelectedMedocIndex] = formedMedoc

      form.reset();
      
      if (this.creationOrdonnance) {
        this.changeStepTo('ordonnance-add');
      }
      else {
        this.changeStepTo('ordonnance-modif')
      }

    }
    catch (err) {
      console.error(err)
      this.gsbMainService.alertInfo("Erreur", `Une erreur s'est produite : ${err}`)
    }

  }

  public cancelMedoc(){
    if (this.creationOrdonnance) {
      this.changeStepTo('ordonnance-add')
    } else {
      this.changeStepTo('ordonnance-modif')
    }
  }

  public removeEditedMedoc() {
    for (let index = 0; index < this.formMedocList.length; index++) {
      if (this.formSelectedMedoc.id === this.formMedocList[index].id) {
        this.formMedocList.splice(index, 1)
        if (this.creationOrdonnance) {
          this.changeStepTo("ordonnance-add")
        }
        else {
          this.changeStepTo("ordonnance-modif")
        }
      }
    }
  }


  public selectColor(color: string) {
    this.gsbMainService.changeColor(this.selectedMedoc, color)
  }


}
