var allBookings;
var allRooms;
var isAdmin;
SetValueToAllRooms();
SetValueToAllBookings();

function SetRole()
{
  isAdmin=false;
  monaca.cloud.User.getProperty("isAdmin")
    .done(function(a){
      if(a){
        isAdmin=true;
      }
    });
}

function ChangeWindowIfAdmin()
{
  if(isAdmin){
    document.location.href = '#add-room-page';
  }
}

function SetValueToAllBookings()
{
  let Bookings = monaca.cloud.Collection("bookingRooms");
  Bookings.find()
  .done(function(bookings)
  {
    if(bookings.totalItems == 0){
      allBookings = null;
    }
    else{
      allBookings = bookings.items;
    }
  })
  .fail(function(err)
  {
      alert("Err#" + err.code +": " + err.message);
  });
}

function SetValueToAllRooms()
{
  let Rooms = monaca.cloud.Collection("availableRooms");
  Rooms.find()
  .done(function(rooms)
  {
    allRooms = rooms.items;
  })
  .fail(function(err)
  {
      alert("Err#" + err.code +": " + err.message);
  });
}

function AddReservation() {
    let building = document.getElementById('building-number').value;
    let room = document.getElementById('room-number').value;
    let date = document.getElementById('date').value;
    let startTime = document.getElementById('startTime').value;
    let endTime = document.getElementById('endTime').value;
    
    if(IsEmpty(building,room,date,startTime,endTime)) {
      alert("Proszę wypełnić wszyskie pola")
      return;
    };

    if(IsInvalid(building,room,date,startTime,endTime, "")) {
      return;
    };

    let Reservation = monaca.cloud.Collection("bookingRooms");

    Reservation.insert({Building: building, Room: room, Date: date, StartReservationTime: startTime, EndReservationTime: endTime })
    .done(function(result){
      alert("Dodano!");
      SetValueToAllBookings();
      document.location.href = '#list-page';
      ShowReservations();
    })
    .fail(function(err){
      alert("Err#" + err.code +": " + err.message);
    });
};

function AddReservation() {
    let building = document.getElementById('building-number').value;
    let room = document.getElementById('room-number').value;
    let date = document.getElementById('date').value;
    let startTime = document.getElementById('startTime').value;
    let endTime = document.getElementById('endTime').value;
    
    if(IsEmpty(building,room,date,startTime,endTime)) {
      alert("Proszę wypełnić wszyskie pola")
      return;
    };

    if(IsInvalid(building,room,date,startTime,endTime, "")) {
      return;
    };

    let Reservation = monaca.cloud.Collection("bookingRooms");

    Reservation.insert({Building: building, Room: room, Date: date, StartReservationTime: startTime, EndReservationTime: endTime })
    .done(function(result){
      alert("Dodano!");
      SetValueToAllBookings();
      document.location.href = '#list-page';
      ShowReservations();
    })
    .fail(function(err){
      alert("Err#" + err.code +": " + err.message);
    });
};

function AddRoom() {
    let building = document.getElementById('add-building').value;
    let room = document.getElementById('add-room').value;
    let startTime = document.getElementById('add-startTime').value;
    let endTime = document.getElementById('add-endTime').value;
    
    if(IsEmpty(building,room,"x",startTime,endTime)) {
      alert("Proszę wypełnić wszyskie pola")
      return;
    };

    if(IsInvalid("x","x","x",startTime,endTime, "")) {
      return;
    };

    let Rooms = monaca.cloud.Collection("availableRooms");

    Rooms.insert({Building: building, Room: room, OpeningTime: startTime, ClosingTime: endTime })
    .done(function(result){
      alert("Dodano!");
      SetValueToAllRooms();
    })
    .fail(function(err){
      alert("Err#" + err.code +": " + err.message);
    });
};

function IsEmpty(b, r, d, sT, eT){
    let isIt = false;
    if(b === ''){
      isIt = true; 
    }
    else if(r === ''){
      isIt = true;
    }
    else if(d === ''){
      isIt = true;
    }
    else if(sT === ''){
      isIt = true;
    }
    else if(eT === ''){
      isIt = true;
    }
    return isIt;
}

function IsInvalid(b, r, d, sT, eT, uID){
  let isIt = false;
  if(d!="x" && IsExpired(d)){
    alert("Rezerwacje dokonujemy z jednodniowym wyprzedzeniem"); 
    isIt = true;
  }
  else if(IsTimeWrong(sT, eT)){
    alert("Godzina końcowa nie może być wcześniej niż początkowa");
    isIt = true;
  }
  else if(b!="x"&&IsRoomInBuilding(b, r)){
    alert("Podana sala nie jest w podanym budynku");
    isIt = true;
  }
  else if(b!="x"&&IsRoomUnavailable(b, r,sT,eT))
  {
    alert("Sala jest zamknieta w tym czasie");
    isIt = true;
  }
  else if(b!="x"&&IsBooked(b, r,d,sT,eT, uID))
  {
    alert("Sala jest zajeta w tym czasie");
    isIt = true;
  }
  return isIt;
}

function IsBooked(building, room,date,sTime,eTime, uID){
  if(allBookings == null) return false;
  let isUn = false;
  allBookings.forEach(function(booking){
    if(booking.Building == building && booking.Room == room && booking.Date == date && (uID=="" || uID!=booking._ownerUserOid))
    {
      if(IsTimeWrong(sTime, booking.EndReservationTime) != IsTimeWrong(eTime, booking.StartReservationTime)){
        isUn = true;
      }
    }
  });
  return isUn;
}

function IsRoomUnavailable(building, room,sTime,eTime){
  let isUn = false;
  allRooms.forEach(function(Room){
    if(Room.Building == building && Room.Room == room)
    {
      if(IsTimeWrong(Room.OpeningTime, sTime) || IsTimeWrong(eTime, Room.ClosingTime)){
        isUn = true;
      }
    }
  });
  return isUn;
}

function IsRoomInBuilding(building, room){
  let isUn = true;
  allRooms.forEach(function(Room){
    if(Room.Building == building && Room.Room == room)
    {
      isUn=false;
    }
  });
  return isUn;
}

function IsExpired(d){
  let today = GetTodayDate();

  let isExpiredYear = today.substring(6,10)>=d.substring(0,4);
  let isExpiredMonth = today.substring(0,2)>=d.substring(5,7);
  let isExpiredDay = today.substring(3,5)>=d.substring(8,10);

  let isExpired = isExpiredYear && isExpiredMonth && isExpiredDay;

  return isExpired;
}

function IsTimeWrong(sTime, eTime){
  let hours = sTime.substring(0,2) < eTime.substring(0,2);
  if(hours) return false;
  
  let hoursAndMinutes = (sTime.substring(0,2) == eTime.substring(0,2)) && (sTime.substring(3,5) < eTime.substring(3,5));
  if(hoursAndMinutes) return false;

  return true;
}

function ShowReservations(){
    let myself = monaca.cloud.User._oid;

    let building;
    let room;
    let date;
    let startTime;
    let endTime;

    //Get array of your building
    
    document.getElementById("reservation-list").innerHTML=""; 

    if(isAdmin){
      let Bookings = monaca.cloud.Collection("bookingRooms");
      Bookings.find()
      .done(function(bookings)
      {
        CreateTable(bookings.items);
      })
      .fail(function(err)
      {
          alert("Err#" + err.code +": " + err.message);
      });
    }
    else{
      let Bookings = monaca.cloud.Collection("bookingRooms");
      Bookings.findMine()
      .done(function(bookings)
      {
        CreateTable(bookings.items);
      })
      .fail(function(err)
      {
          alert("Err#" + err.code +": " + err.message);
      });
    }
}

function CreateTable(items){
  items.forEach(function(item){
    $("#reservation-list").append("<li id="+"li_"+item._id+"> <h3> Rezerwacja: " + item.Building + " " + item.Room + "</h3> <p>" + item.Date + " od " + item.StartReservationTime + " do " + item.EndReservationTime + 
    "</p> <input id="+item._id+" type='button' value='Edytuj' onclick='EditPage(this.id)'> <input id="+item._id+" type='button' value='Usuń' onclick='Delete(this.id)'> </li>")
    $("#reservation-list").listview('refresh');
  });
}

function Delete(id){
  let Reservation = monaca.cloud.Collection("bookingRooms")

  Reservation.findOne({_id : id})
  .done(function(item)
  {
    if(confirm("Czy na pewno chcesz usunąć rezerwację?")){
      item.remove();
      ShowReservations();
      SetValueToAllBookings();
    }
  })
  .fail(function(err)
  {
    alert("Err#" + err.code +": " + err.message);
  });
}

function EditPage(id){
  let Reservation = monaca.cloud.Collection("bookingRooms");
  
  let Critetia = monaca.cloud.Criteria(
    '_id IN ["'+id+'"]'
  );

  Reservation.findOne(Critetia)
  .done(function(item)
  {
    document.getElementById('edit-user').value = item._ownerUserOid;
    document.getElementById('edit-building-number').value = item.Building;
    document.getElementById('edit-room-number').value = item.Room;
    document.getElementById('edit-date').value = item.Date;
    document.getElementById('edit-startTime').value = item.StartReservationTime;
    document.getElementById('edit-endTime').value = item.EndReservationTime;
    document.location.href = '#edit-page';
  })
  .fail(function(err)
  {
    alert("Err#" + err.code +": " + err.message);
  });
}

function Edit(id){
  let Reservation = monaca.cloud.Collection("bookingRooms")

  Reservation.findOne({_id : id})
  .done(function(item)
  {
    if(confirm("Czy na pewno chcesz dokonac zmiany?")){
      let uID = document.getElementById('edit-user').value;

      let building = document.getElementById('edit-building-number').value
      let room = document.getElementById('edit-room-number').value
      let newDate = document.getElementById('edit-date').value;
      let newSTime = document.getElementById('edit-startTime').value;
      let newETime = document.getElementById('edit-endTime').value;

      if(IsInvalid(building, room, newDate, newSTime, newETime, uID)) return;
      
      item.Date = newDate
      item.StartReservationTime = newSTime; 
      item.EndReservationTime = newETime;

      item.update()
      .done(function(result)
      {
        alert("Zmiana została dokonana");
        ShowReservations();
        document.location.href = '#list-page';
        SetValueToAllBookings();
      })
      .fail(function(err)
      {
          alert("Err#" + err.code +": " + err.message);
      });
    }
  })
  .fail(function(err)
  {
    alert("Err#" + err.code +": " + err.message);
  });
}

function Login(){
  let login = document.getElementById('login').value;
  let password = document.getElementById('password').value;
  
  monaca.cloud.User.login(login, password)
  .done(function(result){
    document.location.href = '#list-page';
    ShowReservations();
    SetRole();
  })
  .fail(function(err){
    alert("Złe parametry (Err#" + err.code + ")");
  });
}

function ConfigSelection(which){
  let nameOfSelection;
  let criteria = "";
  if(which==0) nameOfSelection = 'building-number';
  else if(which==1) { nameOfSelection = 'room-number'; criteria='Building == '+document.getElementById('building-number').value;} 
  let selection = document.getElementById(nameOfSelection);

  let Sale = monaca.cloud.Collection("availableRooms");
  Sale.find(criteria)
  .done(function(result)
  {
      let numbers = [];

      result.items.forEach(function(item){
        let name
        if(which==0) name = item.Building;
        else if(which==1) name = item.Room;

        if(!numbers.includes(name)) numbers.push(name);
      });

      selection.options.length = 1;
      numbers.forEach(function(item){
        let option = document.createElement("option");
        option.text = item;
        option.value = item;
        selection.add(option);
      });
  })
  .fail(function(err)
  {
      alert("Err#" + err.code +": " + err.message);
  });
}

function ConfigSelectionEdit(which){
  let nameOfSelection;
  if(which==0) nameOfSelection = 'edit-building-number';
  else if(which==1) { nameOfSelection = 'edit-room-number'} ;
  let selection = document.getElementById(nameOfSelection);

  let Sale = monaca.cloud.Collection("availableRooms");
  Sale.find()
  .done(function(result)
  {
      let numbers = [];

      result.items.forEach(function(item){
        let name
        if(which==0) name = item.Building;
        else if(which==1) name = item.Room;

        if(!numbers.includes(name)) numbers.push(name);
      });

      selection.options.length = 0;
      numbers.forEach(function(item){
        let option = document.createElement("option");
        option.text = item;
        option.value = item;
        selection.add(option);
      });
  })
  .fail(function(err)
  {
      alert("Err#" + err.code +": " + err.message);
  });
}

function AddLimitTimeInfo(){
  let Critetia = monaca.cloud.Criteria(
    'Building IN ["'+document.getElementById("building-number").value+'"] && Room IN ["'+document.getElementById('room-number').value+'"]'
  );

  let Sale = monaca.cloud.Collection("availableRooms");
  Sale.find(Critetia)
  .done(function(result){
    alert("Pokój można rezerwować od "+ result.items[0].OpeningTime + " do "+ result.items[0].ClosingTime);
  })
  .fail(function(err){
    alert(err);
  });
}

function ConfigOption(which){
  if(which==0){
    let date = document.getElementById('date');
    date.setAttribute('min',GetTodayDate()); 
  }
  else if(which==1){
    
  }
  else if(which==2){

  }
}

function GetTodayDate(){
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  return today;
}

function Register(){
  let login = document.getElementById('registration-login').value;
  let password = document.getElementById('registration-password').value;
  let name = document.getElementById('registration-name').value;
  let surname = document.getElementById('registration-surname').value;

  monaca.cloud.User.validate(login, {Name:name, Surname:surname})
  .done(function(result)
  {
    monaca.cloud.User.register(login, password, {isAdmin:false, Name:name, Surname:surname})
    .done(function(result){
      document.location.href = '#login-page';
    })
    .fail(function(err)
    {
      alert("Złe parametry (Err#" + err.code + ")" + "register");
    });
  })
  .fail(function(err)
  {
    alert("Złe parametry (Err#" + err.code + ")" + "validate");
  });
}