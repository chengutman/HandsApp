const { google } = require('googleapis');
 
const deleteEvent = async (auth, id) => {
  const calendar = google.calendar({ version: 'v3', auth });
  try{
    const result = google.events.delete({
      auth: auth,
      eventId: id,
      calendarId: 'primary'
    });
    return 'Deleted';
  }catch(err){
    return -1;
  }
}
const addEvent = async (auth, event) => {
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    const result = await calendar.events.insert({
      auth: auth,
      calendarId: 'primary',
      resource: event,
    });
    return result.data.id;
  } catch (err) {
    return -1;
  }
}
const editEvent = async (auth, id ,updateEvent) => {
  const calendar = google.calendar({ version: 'v3', auth });
  var event = await calendar.events.get({ calendarId: "primary", eventId: id });
  event.start = updateEvent.start;
  event.end = updateEvent.end;
  try {
    const result = await calendar.events.patch({
      auth: auth,
      eventId: id,
      calendarId: 'primary',
      resource: updateEvent,
    });
   return 0;
  } catch (err) {
    return -1;
  }
}
const sendInvite = async (auth, id, email) => {
  const calendar = google.calendar({ version: 'v3', auth });
  var event = await calendar.events.get({ calendarId: "primary", eventId: id });
  if (event.data.attendees) {
    var eventAttendees = event.data.attendees;
    eventAttendees.push({
      email: email
    });
  } else {
    eventAttendees = new Array({ email: email });
  }
  try {
    const result = await calendar.events.patch({
      auth: auth,
      calendarId: 'primary',
      eventId: id,
      resource: { attendees: eventAttendees },
      sendUpdates: 'all'
    });
    return 0;
  } catch (err) {
    return -1;
  }
}
module.exports = {
  addEvent,
  sendInvite, 
  editEvent,
  deleteEvent
}