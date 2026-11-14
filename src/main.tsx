import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import './index.css'
import { Header } from './componentes/Header.tsx'
import { AuthProvider, RotaProtegida } from './contexto/AuthContext.tsx'
import { FormPage } from './pages/FormPage.tsx'
import { ListaPage } from './pages/ListaPage.tsx'
import { LojaPage } from './pages/LojaPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { PerfilPage } from './pages/PerfilPage.tsx'

// Os gráficos (biblioteca pesada) só são baixados quando a página é aberta
const EstatisticasPage = lazy(() =>
  import('./pages/EstatisticasPage.tsx').then((modulo) => ({ default: modulo.EstatisticasPage }))
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Header />

        <main className='page-content'>
          <Routes>
            <Route path='/' element={<LojaPage />} />
            <Route path='/login' element={<LoginPage />} />

            {/* Só com login: o botão Admin da loja cai aqui */}
            <Route element={<RotaProtegida />}>
              <Route path='/admin' element={<Navigate to='/estatisticas' replace />} />
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
