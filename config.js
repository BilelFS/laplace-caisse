/* Connexion au serveur en ligne (Supabase, projet laplace-caisse). La clé "anon" est publique par conception :
   la sécurité vient des règles d'accès (RLS) : seuls les comptes de la table staff voient les données. */
window.LP_CONFIG = {
  supabaseUrl: 'https://veeweyojqveqpccdeaxn.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZXdleW9qcXZlcXBjY2RlYXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NzU2NDAsImV4cCI6MjEwODQ1MTY0MH0.gjAt8WuB0NkAoEr8tskJGx17jCEGU87XmeUuJ6SNvhI'
};
