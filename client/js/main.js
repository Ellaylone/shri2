var Modal = function(elem, confirm, toggle){
    this.elem = elem;
    this.overlay = document.getElementById("overlay");
    this.messageElem = this.elem.getElementsByClassName("modal__message")[0];
    var that = this;
    this.elem.getElementsByClassName("modal__close")[0].addEventListener(
        "click",
        function(){ that.hide(); },
        false
    );
    this.elem.getElementsByClassName("modal__confirm")[0].addEventListener(
        "click",
        function(){
            confirm();
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
    this.hideMessage();
    return this;
}

Modal.prototype.hide = function(){
    this.overlay.classList.add("hidden");
    this.elem.classList.add("hidden");
    this.hideMessage();
    return this;
}

Modal.prototype.hideMessage = function(){
    this.messageElem.classList.add("hidden");
    this.messageElem.innerHTML = "";
    this.messageElem.classList.remove("modal__message__error");
}

Modal.prototype.showMessage = function(message, type){
    this.messageElem.innerHTML = message;
    this.messageElem.classList.remove("hidden");
    if(type == "error"){
        this.messageElem.classList.add("modal__message__error");
    }
}

function formStudentList(data){
    if(typeof data.error != "undefined"){
        console.log(data.error);
    } else {
        var studentlist = document.getElementsByClassName("studentlist")[0];
        for(var i = 0; i < data.length; i++){
            var student = document.createElement("li");
            student.classList.add("studentlist-student");
            student.classList.add("needsclick");
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
    addStudent,
    document.getElementsByClassName("studentadd-button")[0]
);

modalList.push(studentAddModal);

document.getElementById("overlay").addEventListener("click", function(){
    modalList.forEach(function(modal){
        modal.hide();
    });
}, false);

function addStudent(){
    var nameElem = document.getElementById("studentadd-name__name");
    var postData = {
        name: nameElem.value
    };
    if(postData.name != ""){
        nameElem.style["background-color"] = "";
        studentApi.students.add(postData, function(data){
            if(typeof data.error != "undefined"){
                studentAddModal.showMessage("Возникла ошибка", "error");
            } else {
                studentAddModal.showMessage("Успешно сохранено");
                setTimeout(function(){studentAddModal.hide()}, 1000);
            }
        });
    } else {
        nameElem.style["background-color"] = "rgba(255, 0, 0, 0.2)";
        studentAddModal.showMessage("Нужно ввести имя", "error");
    }
}
