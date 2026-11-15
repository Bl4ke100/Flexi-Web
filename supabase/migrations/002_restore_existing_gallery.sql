-- Carry the original website gallery into Supabase without replacing existing photos.
-- Run once when migrating the website; future gallery changes belong in the admin panel.
insert into public.gallery_photos
  (customer_name, location, vehicle_name, quote, trip_tag, image_url, status, reviewed_at, created_at)
select original.customer_name, original.location, original.vehicle_name, original.quote,
  original.trip_tag, original.image_url, 'approved', now(), now() - original.position * interval '1 second'
from (values
  ('Kasun & Family', 'Katunayake BIA Airport', 'Toyota Axio Hybrid WxB', 'Car was waiting right outside BIA arrivals at 2 AM—spotless and ice-cold A/C!', 'AIRPORT HANDOVER // 01', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=85', 0),
  ('Lukas & Hannah (UK)', 'Kandy → Ella Road Trip', 'Toyota Raize Z Turbo', '10 days driving from Colombo to Kandy and Ella. Zero issues and great fuel economy.', 'HILL COUNTRY // 02', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=85', 1),
  ('Dinesh Perera', 'Colombo 07 • Doorstep', 'Suzuki Wagon R Hybrid', 'Delivered to my house in 25 minutes. Got 22 km/L around Colombo all week.', 'CITY COMMUTE // 03', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=85', 2),
  ('Amaya & Friends', 'Galle Fort & Mirissa', 'Honda Vezel RS Sensing', 'Smooth highway cruise down the Southern Expressway. Super clean interior!', 'SOUTH COAST // 04', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=85', 3),
  ('Silva Family (10 Pax)', 'Nuwara Eliya & Yala', 'Toyota KDH High-Roof Van', 'Rented the KDH van with a driver for our family trip. Best service in Sri Lanka.', 'FAMILY TOUR // 05', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=85', 4),
  ('Nalin & Tharushi', 'Negombo Beach', 'Toyota Prius S Touring', 'Super easy AAC permit process and refundable deposit returned on the spot.', 'COASTAL RUN // 06', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=85', 5),
  ('Marco & Elena (Italy)', 'Sigiriya & Dambulla', 'Toyota Raize Z Turbo', 'High ground clearance made driving around Sigiriya and Habarana effortless.', 'CULTURAL ROUTE // 07', 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=900&q=85', 6),
  ('Chathura Wijesinghe', 'Colombo handover', 'Toyota Axio Hybrid WxB', 'Booked two white Axio WxB sedans for a family wedding. Immaculate condition.', 'WEDDING RENTAL // 08', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=85', 7),
  ('Roshan & Dilani', 'Down South Expressway', 'Suzuki Wagon R Hybrid', 'Rs. 8,500/day with zero hidden charges. Our go-to rental in Colombo!', 'WEEKEND TRIP // 09', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=85', 8),
  ('David & Crew (Australia)', 'Arugam Bay & Ella', 'Toyota KDH High-Roof Van', 'Fitted all our boards and luggage easily. 10/10 communication on WhatsApp.', 'SURF & HILLS // 10', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85', 9)
) as original(customer_name, location, vehicle_name, quote, trip_tag, image_url, position)
where not exists (
  select 1 from public.gallery_photos existing
  where existing.image_url = original.image_url and existing.trip_tag = original.trip_tag
);
