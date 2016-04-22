var Modal = function(elem, confirm, toggle){
    this.elem = elem;
    this.overlay = document.getElementById("overlay");
    var that = this;
    this.elem.getElementsByClassName("modal__close")[0].addEventListener(
        "click",
        function(){ that.hide(); },
        false
    );
    this.elem.getElementsByClassName("modal__confirm")[0].addEventListener(
        "click",
        function(){
            if(confirm()){
                that.hide();
            }
        },
        false
    );
    if(typeof toggle !== 'undefined'){
        toggle.addEventListener("click", function(){ that.show(); }, false);
    }
}

Modal.prototype.show = function(){
    this.overlay.classList.remove("hidden");
    this.elem.classList.remove("hidden");
    return this;
}

Modal.prototype.hide = function(){
    this.overlay.classList.add("hidden");
    this.elem.classList.add("hidden");
    return this;
}

function formStudentList(data){
    if(typeof data.error != "undefined"){
        console.log(data.error);
    } else {
        var studentlist = document.getElementsByClassName("studentlist")[0];
        for(var i = 0; i < data.length; i++){
            var student = document.createElement("li");
            student.classList.add("studentlist-student");
            student.dataset.id = data[i].id;
            student.dataset.groupId = data[i].group;

            var studentText = document.createTextNode(data[i].name);
            student.appendChild(studentText);

            studentlist.appendChild(student);
        }
    }
}
studentApi.students.get(formStudentList);

var modalList = [];
var studentAddModal = new Modal(
    document.getElementById("studentlistModal"),
    function(){
        console.log("add student");
        return true;
    },
    document.getElementsByClassName("studentadd-button")[0]
);

modalList.push(studentAddModal);

document.getElementById("overlay").addEventListener("click", function(){
    modalList.forEach(function(modal){
        modal.hide();
    });
}, false);

