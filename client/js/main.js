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
            student.classList.add("defaultlist-elem");
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

function formGroupsList(data){
    if(typeof data.error != "undefined"){
        console.log(data.error);
    } else {
        var grouplist = document.getElementsByClassName("grouplist")[0];
        for(var i = 0; i < data.length; i++){
            var group = document.createElement("li");
            group.classList.add("grouplist-group");
            group.classList.add("defaultlist-elem");
            group.classList.add("needsclick");
            group.dataset.id = data[i].id;

            var groupText = document.createTextNode(data[i].name);
            group.appendChild(groupText);

            grouplist.appendChild(group);
        }
    }
}

studentApi.groups.get(formGroupsList);

var modalList = [];
var studentAddModal = new Modal(
    document.getElementById("studentlistModal"),
    addStudent,
    document.getElementsByClassName("studentadd-button")[0]
);
modalList.push(studentAddModal);

var groupAddModal = new Modal(
    document.getElementById("grouplistModal"),
    addGroup,
    document.getElementsByClassName("groupadd-button")[0]
);
modalList.push(groupAddModal);


document.getElementById("overlay").addEventListener("click", function(){
    modalList.forEach(function(modal){
        modal.hide();
    });
}, false);

var saveSuccessMessage = "Успешно сохранено";
var saveServerError = "Возникла ошибка при сохранении";

function addStudent(){
    var nameElem = document.getElementById("studentadd-name__name");
    var postData = {
        name: nameElem.value
    };
    if(postData.name != ""){
        nameElem.style["background-color"] = "";
        studentApi.students.add(postData, function(data){
            if(typeof data.error != "undefined"){
                studentAddModal.showMessage(saveServerError, "error");
            } else {
                studentAddModal.showMessage(saveSuccessMessage);
                setTimeout(function(){studentAddModal.hide()}, 1000);
            }
        });
    } else {
        nameElem.style["background-color"] = "rgba(255, 0, 0, 0.2)";
        studentAddModal.showMessage("Нужно ввести имя", "error");
    }
}

function addGroup(){
    var nameElem = document.getElementById("groupadd-name__name");
    var postData = {
        name: nameElem.value
    };
    if(postData.name != ""){
        nameElem.style["background-color"] = "";
        studentApi.groups.add(postData, function(data){
            if(typeof data.error != "undefined"){
                groupAddModal.showMessage(saveServerError, "error");
            } else {
                groupAddModal.showMessage(saveSuccessMessage);
                setTimeout(function(){groupAddModal.hide()}, 1000);
            }
        });
    } else {
        nameElem.style["background-color"] = "rgba(255, 0, 0, 0.2)";
        groupAddModal.showMessage("Нужно ввести название", "error");
    }
}
