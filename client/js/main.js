var Modal = function(elem){
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

Modal.prototype.unloadModal = function(){
    this.body.innerHTML = "";
}

function onModalConfirmClick(e){
    var form = e.target.parentNode.getElementsByTagName("form")[0];

    switch(form.className){
    case "studentadd":
        onStudentAddSubmit(form);
        break;
    case "groupadd":
        onGroupAddSubmit(form);
        break;
    case "taskadd":
        onTaskAddSubmit(form);
        break;
    case "mentoradd":
        onMentorAddSubmit(form);
        break;
    default:
        break;
    }
}

var saveSuccessMessage = "Успешно сохранено";
var saveServerError = "Возникла ошибка при сохранении";

function saveSuccess(updateList){
    updateList();
    mainModal.showMessage(saveSuccessMessage);
    setTimeout(function(){mainModal.hide()}, 1000);
}

function saveError(){
    mainModal.showMessage(saveServerError, "error");
}

function readyDefaultSubmitData(form){
    var postData = {};
    var error = false;
    [].forEach.call(form.querySelectorAll("input, textarea"), function(field){
        if(field.value == "" && field.type != "hidden"){
            if(field.className == ""){
                field.className = "fielderror";
            } else {
                field.classList.add("fielderror");
            }
            error = true;
        } else {
            field.classList.remove("fielderror");
        }
        postData[field.name] = field.value;
    });
    if(error){
        return false;
    } else {
        return postData;
    }
}

function onStudentAddSubmit(form){
    var postData = readyDefaultSubmitData(form);
    if(postData){
        var group = form.querySelector("#studentadd-group__group").querySelector("input:checked");
        if(group != null){
            group = group.value;
        } else {
            group = 0;
        }
        postData.tasks = [];
        postData.taskResults = [];
        postData.preferedMentors = [];
        if(parseInt(postData.id) != 0){
            [].forEach.call(form.querySelector("#studentadd-tasks__tasks").querySelectorAll("option:checked"), function(task){
                postData.tasks.push(parseInt(task.value));
            });
            [].forEach.call(form.querySelectorAll("#studentadd-taskResults__taskResults>div"), function(taskResult){
                postData.taskResults.push([parseInt(taskResult.dataset.id), parseInt(taskResult.querySelector("option:checked").value)]);
            });
            [].forEach.call(form.querySelector(".studentadd-preferedMentors").querySelectorAll("li"), function(student){
                postData.preferedMentors.push(parseInt(student.dataset.id));
            })
        }
        postData.group = group;
        postData = JSON.stringify(postData);
        studentApi.students.save(postData, function(data){
            if(typeof data.status != "undefined" && data.status == "ok"){
                saveSuccess(function(){studentApi.groups.get(updateGroupsList)});
            } else {
                saveError();
            }
        });
    }
}

function onTaskAddSubmit(form){
    //NOTE формируем список всех пользователей кому выставлен таск
    var postData = readyDefaultSubmitData(form);
    if(postData){
        var students = [];
        var groups = [];
        var activeStudents = [];
        [].forEach.call(form.querySelector("#taskadd-groups__groups").querySelectorAll("input:checked"), function(group){
            groups.push(parseInt(group.value));
        });

        [].forEach.call(form.querySelector("#taskadd-students__students").querySelectorAll("input:checked"), function(student){
            students.push(parseInt(student.value));
        });

        if(groups.length > 0){
            listData.students.forEach(function(student){
                if(groups.indexOf(student.group) >= 0){
                    activeStudents.push(student.id);
                }
            })
        }
        if(students.length > 0){
            students.forEach(function(student){
                if(activeStudents.indexOf(student) < 0){
                    activeStudents.push(student);
                }
            })
        }

        delete postData["taskadd-groups__groups__checkbox"];
        delete postData["taskadd-students__students__checkbox"]
        postData.students = activeStudents;

        postData = JSON.stringify(postData);
        studentApi.tasks.save(postData, function(data){
            if(typeof data.status != "undefined" && data.status == "ok"){
                saveSuccess(function(){studentApi.groups.get(updateGroupsList)});
            } else {
                saveError();
            }
        });
    }
}

function onMentorAddSubmit(form){
    var postData = readyDefaultSubmitData(form);
    if(postData){
        var preferedStudents = [];
        if(parseInt(postData.id) != 0){
            [].forEach.call(form.querySelector(".mentoradd-preferedStudents").querySelectorAll("li"), function(student){
                preferedStudents.push(parseInt(student.dataset.id));
            })

            if(postData.students == ""){
                postData.students = [];
            } else {
                postData.students = postData.students.split(",");
                [].forEach.call(postData.students, function(student, i){
                    postData.students[i] = +postData.students[i];
                });
            }
            postData.preferedStudents = preferedStudents;
        } else {
            postData.students = [];
            postData.preferedStudents = [];
        }

        postData = JSON.stringify(postData);
        studentApi.groups.save(postData, function(data){
            if(typeof data.status != "undefined" && data.status == "ok"){
                saveSuccess(function(){studentApi.groups.get(updateGroupsList)});
            } else {
                saveError();
            }
        });
    }
}

function onGroupAddSubmit(form){
    var postData = readyDefaultSubmitData(form);
    if(postData){
        postData = JSON.stringify(postData);
        studentApi.groups.save(postData, function(data){
            if(typeof data.status != "undefined" && data.status == "ok"){
                saveSuccess(function(){studentApi.groups.get(updateGroupsList)});
            } else {
                saveError();
            }
        });
    }
}

//NOTE add and edit in modal
function onDefaultEdit(modalHTML){
    mainModal.body.innerHTML = modalHTML;
    mainModal.show();
}

function onAddMentorClick(){
    onDefaultEdit(renderMentorAddForm("Добавить ментора", {
        name: "",
        id: 0,
        students: [],
        preferedStudents: []
    }));
}

function onUpdateMentorClick(e){
    const container = this.closest(".mentorlist-mentor");
    const data = container.dataset.data;
    onDefaultEdit(renderMentorUpdateForm("Редактировать ментора", JSON.parse(data)));
    callNativesortable();
}

function renderMentorFormOneStudent(data){
    return `
        <li data-id="${data.id}" draggable="true" class="sortable-item needsclick">${data.name}</li>
    `;
}

function renderMentorFormStudents(data){
    var preferedStudents = [];
    var preferedStudentsSorted = [];
    listData.students.forEach(function(student){
        preferedStudents[student.id] = student;
    });

    var sortableStudents = "";
    data.preferedStudents.forEach(function(prefered, id){
        if(typeof preferedStudents[prefered] != "undefined"){
            preferedStudentsSorted.push(preferedStudents[prefered]);
        }
    });
    preferedStudents.forEach(function(prefered, id){
        if(data.preferedStudents.indexOf(id) < 0)
            preferedStudentsSorted.push(prefered);
    });
    preferedStudentsSorted.forEach(function(prefered){
        sortableStudents += renderMentorFormOneStudent(prefered);
    })

    return `
        <div class="mentoradd-preferedStudents">
            <label>Приоритет студентов</label>
            <br />
            <ul class="sortable">${sortableStudents}</ul>
        </div>
    `;
}

function renderMentorUpdateForm(title, data){
    const sortableStudents = renderMentorFormStudents(data);
    return `
        <div class="modal__body">
        <h2>${title}</h2>
        <div class="modal__body__fields">
        <form class="mentoradd">
        <input type="hidden" name="id" value="${data.id}">
        <input type="hidden" name="students" value="${data.students.toString()}">
        <div class="mentoradd-name">
        <label for="mentoradd-name__name" class="needsclick">Имя</label>
        <input name="name" type="text" id="mentoradd-name__name" value="${data.name}">
        </div>
        ${sortableStudents}
        </form>
        </div>
        </div>
        `;
}

function renderMentorAddForm(title, data){
    return `
        <div class="modal__body">
        <h2>${title}</h2>
        <div class="modal__body__fields">
        <form class="mentoradd">
        <input type="hidden" name="id" value="${data.id}">
        <div class="mentoradd-name">
        <label for="mentoradd-name__name" class="needsclick">Имя</label>
        <input name="name" type="text" id="mentoradd-name__name" value="${data.name}">
        </div>

        </form>
        </div>
        </div>
        `;
}

function onAddGroupClick(){
    onDefaultEdit(renderGroupForm("Добавить группу", {
        name: "",
        id: 0
    }));
}

function onUpdateGroupClick(e){
    const container = this.closest(".grouplist-group");
    const data = container.dataset.data;
    onDefaultEdit(renderGroupForm("Редактировать группу", JSON.parse(data)));
}

function renderGroupForm(title, data){
    return `
        <div class="modal__body">
        <h2>${title}</h2>
        <div class="modal__body__fields">
        <form class="groupadd">
        <input type="hidden" name="id" value="${data.id}">
        <div class="groupadd-name">
        <label for="groupadd-name__name" class="needsclick">Имя</label>
        <input name="name" type="text" id="groupadd-name__name" value="${data.name}">
        </div>
        </form>
        </div>
        </div>
        `;
}

function onAddTaskClick(){
    onDefaultEdit(renderTaskForm("Добавить задачу", {
        name: "",
        id: 0,
        description: ""
    }));
}

function onUpdateTaskClick(e){
    const container = this.closest(".tasklist-task");
    const data = container.dataset.data;
    onDefaultEdit(renderTaskForm("Редактировать задачу", JSON.parse(data)));
}

function renderTaskFormOneGroup(data, active){
    var checked = (active ? "checked" : "");
    return `
        <input ${checked} type="checkbox" value="${data.id}" name="taskadd-groups__groups__checkbox" id="taskadd-groups__groups__checkbox${data.id}">
        <label for="taskadd-groups__groups__checkbox${data.id}" class="needsclick">${data.name}</label>
        `;
}

function renderTaskFormGroups(data){
    var groupCheckboxes = "";
    [].forEach.call(listData.groups,function(group){
        groupCheckboxes += renderTaskFormOneGroup(group, (group.tasks.indexOf(data.id) >= 0 ? true : false));
    });
    return `
        <div class="taskadd-groups">
        <label for="taskadd-groups__group">Группа</label>
        <div id="taskadd-groups__groups">${groupCheckboxes}</div>
        </div>
        `;
}

function renderTaskFormOneStudent(data, active){
    var checked = (active ? "checked" : "");
    return `
        <input ${checked} type="checkbox" value="${data.id}" name="taskadd-students__students__checkbox" id="taskadd-students__students__checkbox${data.id}">
        <label for="taskadd-students__students__checkbox${data.id}" class="needsclick">${data.name}</label>
        `;
}

function renderTaskFormStudents(data){
    var studentCheckboxes = "";
    [].forEach.call(listData.students,function(student){
        studentCheckboxes += renderTaskFormOneStudent(student, (student.tasks.indexOf(data.id) >= 0 ? true : false));
    });
    return `
        <div class="taskadd-students">
        <label for="taskadd-students__student">Студенты</label>
        <div id="taskadd-students__students">${studentCheckboxes}</div>
        </div>
        `;
}

function renderTaskForm(title, data){
    const taskGroup = renderTaskFormGroups(data);
    const taskStudents = renderTaskFormStudents(data);
    return `
        <div class="modal__body">
        <h2>${title}</h2>
        <div class="modal__body__fields">
        <form class="taskadd">
        <input type="hidden" name="id" value="${data.id}">
        <div class="taskadd-name">
        <label for="taskadd-name__name" class="needsclick">Имя</label>
        <input name="name" type="text" id="taskadd-name__name" value="${data.name}">
        </div>
        <div class="taskadd-description">
        <label for="taskadd-description__description" class="needsclick">Описание</label>
        <textarea name="description" id="taskadd-description__description" rows="5" cols="40">${data.description}</textarea>
        </div>
        ${taskGroup}
        ${taskStudents}
        </form>
        </div>
        </div>
        `;
}

function onAddStudentClick(){
    onDefaultEdit(renderAddStudentForm("Добавить студента", {
        name: "",
        id: 0,
        group: 0,
        tasks: [],
        taskResults: []
    }));
}

function onUpdateStudentClick(e){
    const container = this.closest(".studentlist-student");
    const data = container.dataset.data;
    onDefaultEdit(renderUpdateStudentForm("Редактировать студента", JSON.parse(data)));
    callNativesortable();
}

function callNativesortable(){
    [].forEach.call(document.querySelectorAll('.modal'), function(container){
        [].forEach.call(document.querySelectorAll('.sortable'), function(sortable){
            nativesortable(sortable, {
            change: function() {

            }
        });
        });
    })
}

function renderStudentForm(title, data, formHTML){
    return `
        <div class="modal__body">
        <h2>${title}</h2>
        <div class="modal__body__fields">
        <form class="studentadd">
        <input type="hidden" name="id" value="${data.id}">
        <div class="studentadd-name">
        <label for="studentadd-name__name" class="needsclick">Имя</label>
        <input name="name" type="text" id="studentadd-name__name" value="${data.name}">
        </div>
        ${formHTML}
        </form>
        </div>
        </div>
        `;
}

function renderAddStudentForm(title, data){
    return renderStudentForm(title, data, renderStudentFormGroups(data));
}

function renderStudentFormOneGroup(data, active){
    var checked = (active ? "checked" : "");
    return `
        <input type="radio" ${checked} value="${data.id}" name="group" id="studentadd-group__group__radio${data.id}">
        <label for="studentadd-group__group__radio${data.id}" class="needsclick">${data.name}</label>
        `;
}

function renderStudentFormGroups(data){
    var groupRadios = "";
    [].forEach.call(listData.groups,function(group){
        groupRadios += renderStudentFormOneGroup(group, (group.id == data.group ? true : false));
    });
    return `
        <div class="studentadd-group">
        <label for="studentadd-group__group">Команда</label>
        <div id="studentadd-group__group">${groupRadios}</div>
        </div>
          `;
}

function renderStudentFormOneTask(data, active){
    var selected = (active ? "selected" : "");
    return `
        <option value="${data.id}" ${selected}>${data.name}</option>
        `;
}

function renderStudentFormTasks(data){
    var taskOptions = "";
    [].forEach.call(listData.tasks,function(task){
        taskOptions += renderStudentFormOneTask(task, (data.tasks.indexOf(task.id) >= 0 ? true : false));
    });
    return `
        <div class="studentadd-task">
        <label for="studentadd-task__task">Задания</label>
        <select multiple="multiple" name="tasks" id="studentadd-tasks__tasks">${taskOptions}</select>
        </div>
        `;
}

function renderStudentFormOneTaskResult(data, active){
    var tastResultOptions = ""
    var marksArray = [0,1,2,3,4,5];
    marksArray.forEach(function(mark){
        var markActive = (mark == active ? "selected" : "");
        tastResultOptions += `<option value="${mark}" ${markActive}>${mark}</option>`;
    })
    return `
        <div data-id="${data.id}">
        <label>${data.name}</label>
        <select>
        ${tastResultOptions}
        </select>
        </div>
        `;
}

function renderStudentFormTaskResults(data){
    var taskResultSelect = "";
    [].forEach.call(data.taskResults,function(task){
        var selectedTask = false;
        for(var i = 0; i < listData.tasks.length; i++){
            if(listData.tasks[i].id == task[0]){
                selectedTask = listData.tasks[i];
                break;
            }
        }
        if(selectedTask){
            taskResultSelect += renderStudentFormOneTaskResult(selectedTask, task[1]);
        }
    });

    return `
        <div class="studentadd-taskResults">
        <label for="studentadd-taskResults__taskResults">Оценки</label>
        <div id="studentadd-taskResults__taskResults">
        ${taskResultSelect}
        </div>
        </div>
        `;
}

function renderStudentFormOneMentor(data){
    return `
        <li data-id="${data.id}" draggable="true" class="sortable-item needsclick">${data.name}</li>
    `;
}

function renderStudentFormMentors(data){
    var preferedMentors = [];
    var preferedMentorsSorted = [];
    listData.mentors.forEach(function(student){
        preferedMentors[student.id] = student;
    });

    var sortableMentors = "";
    data.preferedMentors.forEach(function(prefered, id){
        if(typeof preferedMentors[prefered] != "undefined"){
            preferedMentorsSorted.push(preferedMentors[prefered]);
        }
    });
    preferedMentors.forEach(function(prefered, id){
        if(data.preferedMentors.indexOf(id) < 0)
            preferedMentorsSorted.push(prefered);
    });
    preferedMentorsSorted.forEach(function(prefered){
        sortableMentors += renderStudentFormOneMentor(prefered);
    })

    return `
        <div class="studentadd-preferedMentors">
            <label>Приоритет менторов</label>
            <br />
            <ul class="sortable">${sortableMentors}</ul>
        </div>
    `;
}

function renderUpdateStudentForm(title, data){
    const studentGroup = renderStudentFormGroups(data);
    const studentTask = renderStudentFormTasks(data);
    const studentTaskResults = renderStudentFormTaskResults(data);
    const studentMentors = renderStudentFormMentors(data);
    return renderStudentForm(title, data, studentGroup + studentTask + studentTaskResults + studentMentors);
}

//NOTE lists of data
function renderGroup(group){
    var borderLeft = "8px solid rgba(" + parseInt(Math.random()*255) + ", " + parseInt(Math.random()*255) + ", " +  parseInt(Math.random()*255) + ", 1)";
    var groupStudents = document.querySelectorAll(".studentlist-student[data-group-id='" + group.id + "']");
    [].forEach.call(
        groupStudents,
        function(container){
            container.style["border-left"] = borderLeft;
        }
    );

    return `
        <li class="grouplist-group defaultlist-elem needsclick" style="border-left: ${borderLeft}" data-data='${JSON.stringify(group)}'} data-id='${group.id}'>${group.name}</li>
    `;
}

function renderStudent(student){
    return `
        <li class="studentlist-student defaultlist-elem needsclick" data-data='${JSON.stringify(student)}' data-id='${student.id}' data-group-id='${student.group}'>${student.name}</li>
        `;
}

function renderTask(task){
    return defaultRender(task, "tasklist-task");
}

function renderMentor(mentor){
    return defaultRender(mentor, "mentorlist-mentor");
}

function defaultRender(data, className){
    return `
        <li class="${className} defaultlist-elem needsclick" data-data='${JSON.stringify(data)}'} data-id='${data.id}'>${data.name}</li>
    `;
}

var listData = {
    students: false,
    groups: false,
    tasks: false,
    mentors: false
}

function updateDefaultList(data, render, listClass){
    if(typeof data.error != "undefined"){
        console.log(data.error);
    } else {
        const listHTML = data.map(render).join('');

        var listWrap = document.getElementsByClassName(listClass);

        [].forEach.call(
            listWrap,
            function(container){
                container.innerHTML = listHTML;
            }
        );
    }
}

function updateStudentsList(data){
    listData.students = data;
    updateDefaultList(data, renderStudent, "studentlist");
}

function updateTasksList(data){
    listData.tasks = data;
    updateDefaultList(data, renderTask, "tasklist");
}

function updateGroupsList(data){
    listData.groups = data;
    updateDefaultList(data, renderGroup, "grouplist");
}

function updateMentorsList(data){
    listData.mentors = data;
    updateDefaultList(data, renderMentor, "mentorlist");
}

function updateAllLists(){
    studentApi.students.get(updateStudentsList);
    studentApi.groups.get(updateGroupsList);
    studentApi.tasks.get(updateTasksList);
    studentApi.mentors.get(updateMentorsList);
}

function delegate(containers, selector, event, handler) {
    [].forEach.call(containers, function(container){
        container.addEventListener(event, function (e) {
            if (e.target.matches(selector)) {
                handler.apply(e.target, arguments);
            }
        });
    });
}

//NOTE init
var mainModal = new Modal(
    document.getElementById("mainModal")
);

document.addEventListener('DOMContentLoaded', function(){
    document.getElementById("overlay").addEventListener("click", function(){
        mainModal.hide();
    }, false);

    [].forEach.call(document.querySelectorAll(".mentoradd-button"), function(selector){
        selector.addEventListener(
            "click",
            onAddMentorClick
        )
    });

    delegate(
        document.querySelectorAll('.mentorlist'),
        '.mentorlist-mentor',
        'click',
        onUpdateMentorClick
    );

    [].forEach.call(document.querySelectorAll(".groupadd-button"), function(selector){
        selector.addEventListener(
            "click",
            onAddGroupClick
        )
    });

    delegate(
        document.querySelectorAll('.grouplist'),
        '.grouplist-group',
        'click',
        onUpdateGroupClick
    );

    [].forEach.call(document.querySelectorAll(".taskadd-button"), function(selector){
        selector.addEventListener(
            "click",
            onAddTaskClick
        )
    });

    delegate(
        document.querySelectorAll('.tasklist'),
        '.tasklist-task',
        'click',
        onUpdateTaskClick
    );

    [].forEach.call(document.querySelectorAll(".studentadd-button"), function(selector){
        selector.addEventListener(
            "click",
            onAddStudentClick
        )
    });

    delegate(
        document.querySelectorAll('.studentlist'),
        '.studentlist-student',
        'click',
        onUpdateStudentClick
    );

    delegate(
        document.querySelectorAll('.modal'),
        '.modal__confirm',
        'click',
        onModalConfirmClick
    );

    updateAllLists();
});
