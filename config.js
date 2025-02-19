// Supabase yapılandırma bilgileri
const SUPABASE_URL = 'https://zdizpniisqmxzqvqmaif.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkaXpwbmlpc3FteHpxdnFtYWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5ODc0MTQsImV4cCI6MjA1NTU2MzQxNH0.QIQRFP9d3F9QCzOLsqjZSdCIl2xcvRG0H8cfLHxZlTc';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);