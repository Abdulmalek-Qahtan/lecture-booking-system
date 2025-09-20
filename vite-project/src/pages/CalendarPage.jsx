import { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, useTheme } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import arSA from 'date-fns/locale/ar-SA';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const locales = { 'ar-SA': arSA };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const theme = useTheme();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/public/bookings`);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        
        const bookings = await response.json();
        console.log('Raw bookings from server:', bookings);
        console.log('--- Raw Bookings from Server ---', JSON.stringify(bookings, null, 2));
        
        const formattedEvents = bookings
          .filter(booking => booking.status === 'approved')
          .filter(booking => booking.startTime && booking.endTime && typeof booking.startTime === 'string' && typeof booking.endTime === 'string')
          .map(booking => {
            // Parse time strings to get hours and minutes
            const [startHour, startMinute] = booking.startTime.split(':');
            const [endHour, endMinute] = booking.endTime.split(':');
            
            // Create booking date object
            const bookingDate = new Date(booking.date);
            
            // Use UTC methods to construct start and end dates to avoid timezone issues
            const start = new Date(
              bookingDate.getUTCFullYear(),
              bookingDate.getUTCMonth(),
              bookingDate.getUTCDate(),
              parseInt(startHour, 10),
              parseInt(startMinute, 10)
            );
            
            const end = new Date(
              bookingDate.getUTCFullYear(),
              bookingDate.getUTCMonth(),
              bookingDate.getUTCDate(),
              parseInt(endHour, 10),
              parseInt(endMinute, 10)
            );

            return {
              title: `${booking.subject} - ${booking.hall.name}`,
              start,
              end,
            };
          });
        
        console.log('formattedEvents:', formattedEvents);
        console.log('Formatted events for calendar:', formattedEvents);
        console.log('--- Formatted Events for Calendar ---', JSON.stringify(formattedEvents, null, 2));
        
        setEvents(formattedEvents);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    
    fetchBookings();
  }, []);

  if (loading) return <Typography>جاري تحميل التقويم...</Typography>;

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 4 }}>
        تقويم الحجوزات
      </Typography>
      
      <Box component={Paper} sx={{ 
        p: 2, 
        height: '75vh',
        '& .rbc-calendar': { backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary },
        '& .rbc-toolbar button': { color: theme.palette.text.primary, '&:hover, &:focus': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } },
        '& .rbc-header': { borderColor: theme.palette.divider, color: theme.palette.text.secondary },
        '& .rbc-day-bg': { borderColor: theme.palette.divider },
        '& .rbc-off-range-bg': { backgroundColor: theme.palette.mode === 'dark' ? '#273442' : '#f0f0f0' },
        '& .rbc-today': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : 'rgba(144, 202, 249, 0.2)' },
        '& .rbc-event': { backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
        '& .rbc-event.rbc-selected': { backgroundColor: theme.palette.secondary?.main || theme.palette.primary.dark },
      }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture="ar-SA"
          rtl={true}
          view={view}
          date={currentDate}
          onView={(view) => setView(view)}
          onNavigate={(date) => setCurrentDate(date)}
          messages={{
              next: "التالي",
              previous: "السابق",
              today: "اليوم",
              month: "شهر",
              week: "أسبوع",
              day: "يوم",
              agenda: "أجندة",
              date: "التاريخ",
              time: "الوقت",
              event: "الحدث",
              showMore: (total) => `+${total} إضافي`,
          }}
        />
      </Box>
    </Container>
  );
}

export default CalendarPage;