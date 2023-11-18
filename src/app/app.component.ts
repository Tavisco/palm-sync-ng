
import { Component } from "@angular/core"; 
import { MenuItem } from "primeng/api"; 
  
@Component({ 
  selector: "app-root", 
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
}) 
export class AppComponent { 
  gfg: MenuItem[] = []; 
  
  ngOnInit() { 
    this.gfg = [ 
      { 
        label: "Web Technology", 
        items: [ 
          { 
            label: "HTML", 
          }, 
          { 
            label: "CSS", 
            items: [ 
              { 
                label: "Pure CSS", 
              }, 
              { 
                label: "Bulma CSS", 
              }, 
              { 
                label: "Foundation CSS", 
              }, 
              { 
                label: "Semantic UI", 
              }, 
            ], 
          }, 
          { 
            label: "Javascript", 
            items: [ 
              { 
                label: "Angular", 
              }, 
              { 
                label: "React", 
              }, 
              { 
                label: "FabricJS", 
              }, 
              { 
                label: "VueJS", 
              }, 
            ], 
          }, 
          { 
            label: "PHP", 
          }, 
          { 
            label: "Database Management System", 
          }, 
        ], 
      }, 
      { 
        label: "Data Structures", 
  
        items: [ 
          { 
            label: "Linked List", 
            items: [ 
              { 
                label: "Singly Linked List", 
              }, 
              { 
                label: "Doubly Linked List", 
              }, 
              { 
                label: "Circular Linked List", 
              }, 
            ], 
          }, 
          { 
            label: "Stack", 
          }, 
          { 
            label: "Queue", 
          }, 
          { 
            label: "Tree", 
          }, 
          { 
            label: "Graph", 
          }, 
          { 
            label: "Heap", 
          }, 
        ], 
      }, 
    ]; 
  } 
}