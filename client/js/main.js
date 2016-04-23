var Modal = function(elem, confirm, toggle){
    this.elem = elem;
    this.body = this.elem.getElementsByClassName("modal__body")[0];
    this.overlay = document.getElementById("overlay");
    this.messageElem = this.elem.getElementsByClassName("modal__message")[0];
    var that = this;
    this.elem.getElementsByClassName("modal__close")[0].addEventListener(
        "click",
        function(){ that.hide(); },
        false
    );
    if(typeof confirm !== "undefined"){
        this.elem.getElementsByClassName("modal__confirm")[0].addEventListener(
            "click",
            function(){
                confirm();
            },
            false
        );
    }
    if(typeof toggle !== "undefined"){
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

Modal.prototype.loadModal = function(params){
    this.elem.getElementsByTagName("h2")[0].innerHTML = params.title;
    this.body.classList.add(params.className);
    this.unloadModal();
    var k = -1;
    if(typeof params.source != "undefined" && typeof params.myId != "undefined"){
        for(k = 0; k < params.source.length; k++){
            if(params.source[k].id == parseInt(params.myId)){
                break;
            }
        }
    }
    for(var i = 0; i < params.fields.length; i++){
        var fieldWrap = document.createElement("div");
        var wrapClass = params.className + "-" + params.fields[i].name;
        var fieldId = wrapClass + "__" + params.fields[i].name;
        fieldWrap.classList.add(wrapClass);

        var fieldLabel = document.createElement("label");
        fieldLabel.setAttribute("for", fieldId);
        fieldLabel.innerText = params.fields[i].label;

        var field;
        switch(params.fields[i].type){
        case "textarea":
            field = document.createElement("textarea");
            if(k >= 0 && typeof params.source[k][params.fields[i].name] != "undefined"){
                field.value = params.source[k][params.fields[i].name];
            }
            break;
        case "radio":
        case "checkbox":
            if(typeof params.fields[i].source != "undefined"){
                field = document.createElement("div");
                var activeMultiple;
                if(k >= 0 && typeof params.source[k][params.fields[i].name] != "undefined"){
                    activeMultiple = params.source[k][params.fields[i].name];
                }

                for(var j = 0; j < params.fields[i].source.length; j++){
                    var fieldMultiple = document.createElement("input");
                    fieldMultiple.setAttribute("type", params.fields[i].type);
                    fieldMultiple.value = params.fields[i].source[j].id;
                    fieldMultiple.name = fieldId + "__" + params.fields[i].type;
                    fieldMultiple.id = fieldId + "__" + params.fields[i].type + params.fields[i].source[j].id;
                    if(typeof activeMultiple == "number" && params.fields[i].source[j].id == activeMultiple){
                        fieldMultiple.setAttribute("checked", "checked");
                    }

                    var fieldMultipleLabel = document.createElement("label");
                    fieldMultipleLabel.setAttribute("for", fieldMultiple.id);
                    fieldMultipleLabel.innerText = params.fields[i].source[j].name;
                    fieldMultipleLabel.classList.add("needsclick");

                    field.appendChild(fieldMultiple);
                    field.appendChild(fieldMultipleLabel);
                }
                break;
            }
        case "select":
            if(params.fields[i].name == "taskResults"){
                field = document.createElement("div");
                var activeMultiple;
                if(k >= 0 && typeof params.source[k][params.fields[i].name] != "undefined"){
                    activeMultiple = params.source[k][params.fields[i].name];
                }
                for(var j = 0; j < params.source[k][params.fields[i].name].length; j++){
                    var taskInfo;
                    for(var l = 0; l < params.fields[i].source.length; l++){
                        if(params.fields[i].source[l].id == params.source[k][params.fields[i].name][j][0]){
                            taskInfo = params.fields[i].source[l];
                            break;
                        }
                    }
                    var markWrap = document.createElement("div");
                    markWrap.dataset.id = params.source[k][params.fields[i].name][j][0];

                    var markLabel = document.createElement("label");
                    markLabel.innerText = taskInfo.name;

                    var markSelect = document.createElement("select");
                    for(var mark = 0; mark <= 5; mark++){
                        var markOption = document.createElement("option");
                        markOption.value = mark;
                        markOption.innerHTML = mark;

                        if(parseInt(mark) == params.source[k][params.fields[i].name][j][1]){
                            markOption.setAttribute("selected", "selected");
                        }

                        markSelect.appendChild(markOption);
                    }

                    markWrap.appendChild(markLabel);
                    markWrap.appendChild(markSelect);
                    field.appendChild(markWrap);
                }
                console.log(activeMultiple);
                break;
            } else if(typeof params.fields[i].source != "undefined"){
                field = document.createElement("select");

                field.setAttribute("multiple", "multiple");
                field.name = fieldId;

                for(var j = 0; j < params.fields[i].source.length; j++){
                    var fieldSelect = document.createElement("option");
                    fieldSelect.value = params.fields[i].source[j].id;
                    fieldSelect.innerHTML = params.fields[i].source[j].name;
                    if(k >= 0 && typeof params.source[k][params.fields[i].name] != "undefined"){
                        if(params.source[k][params.fields[i].name].indexOf(params.fields[i].source[j].id) >=0){
                            fieldSelect.setAttribute("selected", "selected");
                        }
                    }

                    field.appendChild(fieldSelect);
                }
                break;
            }
        default:
            field = document.createElement("input");
            field.setAttribute("type", params.fields[i].type);
            if(k >= 0 && typeof params.source[k][params.fields[i].name] != "undefined"){
                field.value = params.source[k][params.fields[i].name];
            }
        }
        field.id = fieldId;

        fieldWrap.appendChild(fieldLabel);
        fieldWrap.appendChild(field);
        this.body.appendChild(fieldWrap);
    }
}

Modal.prototype.unloadModal = function(){
    this.body.innerHTML = "";
}

var listData = {
    students: false,
    groups: false,
    tasks: false,
    mentors: false
}

function formStudentList(data){
    if(typeof data.error != "undefined"){
        console.log(data.error);
    } else {
        var studentlist = document.getElementsByClassName("studentlist")[0];
        listData.students = data;
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
        listData.groups = data;
        var grouplist = document.getElementsByClassName("grouplist")[0];
        var students = document.getElementsByClassName("studentlist")[0].getElementsByClassName("studentlist-student");
        for(var i = 0; i < data.length; i++){
            var group = document.createElement("li");
            group.classList.add("grouplist-group");
            group.classList.add("defaultlist-elem");
            group.classList.add("needsclick");
            group.dataset.id = data[i].id;
            var borderStyle = "8px solid rgba(" + parseInt(Math.random()*255) + ", " + parseInt(Math.random()*255) + ", " +  parseInt(Math.random()*255) + ", 1)";
            group.style["border-left"] = borderStyle;

            var groupText = document.createTextNode(data[i].name);
            group.appendChild(groupText);

            grouplist.appendChild(group);
            for(var j = 0; j < students.length; j++){
                if(students[j].dataset.groupId == data[i].id){
                    students[j].style["border-left"] = borderStyle;
                }
            }
        }
    }
}

studentApi.groups.get(formGroupsList);

function formTaskList(data){
    if(typeof data.error != "undefined"){
        console.log(data.error);
    } else {
        listData.tasks = data;
        var tasklist = document.getElementsByClassName("tasklist")[0];
        for(var i = 0; i < data.length; i++){
            var task = document.createElement("li");
            task.classList.add("tasklist-task");
            task.classList.add("defaultlist-elem");
            task.classList.add("needsclick");
            task.dataset.id = data[i].id;

            var taskText = document.createTextNode(data[i].name);
            task.appendChild(taskText);

            tasklist.appendChild(task);
        }
    }
}
studentApi.tasks.get(formTaskList);

function formMentorsList(data){
    if(typeof data.error != "undefined"){
        console.log(data.error);
    } else {
        listData.mentors = data;
        var mentorlist = document.getElementsByClassName("mentorlist")[0];
        for(var i = 0; i < data.length; i++){
            var mentor = document.createElement("li");
            mentor.classList.add("mentorlist-mentor");
            mentor.classList.add("defaultlist-elem");
            mentor.classList.add("needsclick");
            mentor.dataset.id = data[i].id;

            var mentorText = document.createTextNode(data[i].name);
            mentor.appendChild(mentorText);

            mentorlist.appendChild(mentor);
        }
    }
}

studentApi.mentors.get(formMentorsList);

var mainModal = new Modal(
    document.getElementById("mainModal")
);

document.getElementsByClassName("studentadd-button")[0].addEventListener(
    "click",
    function(){
        mainModal.loadModal({
            title: "Добавить студента",
            className: "studentadd",
            fields: [
                {
                    name: "name",
                    label: "Имя",
                    type: "text"
                },
                {
                    name: "group",
                    label: "Команда",
                    type: "radio",
                    source: listData.groups
                }
            ]
        });
        mainModal.show()
    },
    false
);

document.getElementsByClassName("studentlist")[0].addEventListener(
    "click",
    function(e){
        if(e.target.classList.contains("studentlist-student")){
            mainModal.loadModal({
                title: "Редактировать студента",
                className: "studentadd",
                source: listData.students,
                myId: e.target.dataset.id,
                fields: [
                    {
                        name: "name",
                        label: "Имя",
                        type: "text"
                    },
                    {
                        name: "group",
                        label: "Команда",
                        type: "radio",
                        source: listData.groups
                    },
                    {
                        name: "tasks",
                        label: "Задания",
                        type: "select",
                        source: listData.tasks
                    },
                    {
                        name: "taskResults",
                        label: "Оценки",
                        type: "select",
                        source: listData.tasks
                    },
                ]
            });
            mainModal.show()
        }
    },
    false
);

document.getElementsByClassName("groupadd-button")[0].addEventListener(
    "click",
    function(){
        mainModal.loadModal({
            title: "Добавить группу",
            className: "groupadd",
            fields: [
                {
                    name: "name",
                    label: "Название",
                    type: "text"
                }
            ]
        });
        mainModal.show()
    },
    false
);

document.getElementsByClassName("taskadd-button")[0].addEventListener(
    "click",
    function(){
        mainModal.loadModal({
            title: "Добавить задачу",
            className: "taskadd",
            fields: [
                {
                    name: "name",
                    label: "Название",
                    type: "text"
                },
                {
                    name: "description",
                    label: "Описание",
                    type: "textarea"
                },
                {
                    name: "groups",
                    label: "Группа",
                    type: "checkbox",
                    source: listData.groups
                },
                {
                    name: "students",
                    label: "Студенты",
                    type: "checkbox",
                    source: listData.students
                }
            ]
        });
        mainModal.show()
    },
    false
);

document.getElementsByClassName("mentoradd-button")[0].addEventListener(
    "click",
    function(){
        mainModal.loadModal({
            title: "Добавить ментора",
            className: "mentoradd",
            fields: [
                {
                    name: "name",
                    label: "Имя",
                    type: "text"
                }
            ]
        });
        mainModal.show()
    },
    false
);

document.getElementById("overlay").addEventListener("click", function(){
    mainModal.hide();
}, false);

document.getElementById("overlay").addEventListener("click", function(){
    mainModal.hide();
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
