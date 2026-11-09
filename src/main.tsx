import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import './index.css'
import { Header } from './componentes/Header.tsx'
import { AuthProvider, RotaProtegida, useAuth } from './contexto/AuthContext.tsx'
import { CadastroPage } from './pages/CadastroPage.tsx'
import { FormPage } from './pages/FormPage.tsx'
import { ListaPage } from './pages/ListaPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { PerfilPage } from './pages/PerfilPage.tsx'

// Os gráficos (biblioteca pesada) só são baixados quando a página é aberta
const EstatisticasPage = lazy(() =>
  import('./pages/EstatisticasPage.tsx').then((modulo) => ({ default: modulo.EstatisticasPage }))
)

// "/" leva para a área logada ou para o cadastro
function Inicio() {
  const { usuario } = useAuth()

  return <Navigate to={usuario ? '/estatisticas' : '/cadastro'} replace />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Header />

        <main className='page-content'>
          <Routes>
            <Route path='/' element={<Inicio />} />
            <Route path='/cadastro' element={<CadastroPage />} />
            <Route path='/login' element={<LoginPage />} />

            {/* Só com login */}
            <Route element={<RotaProtegida />}>
              <Route path='/estatisticas' element={<Suspense fallback={<p>Carregando...</p>}><EstatisticasPage /></Suspense>} />
              <Route path='/perfil' element={<PerfilPage />} />

              {/* Os 4 CRUDs: /categorias, /produtos, /clientes e /pedidos */}
              <Route path='/:recurso' element={<ListaPage />} />
              <Route path='/:recurso/novo' element={<FormPage />} />
              <Route path='/:recurso/:id/editar' element={<FormPage />} />
            </Route>

            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>

    <ToastContainer position='bottom-right' autoClose={3500} />
  </StrictMode>,
)
