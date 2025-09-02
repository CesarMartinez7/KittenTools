import { useState, useEffect } from 'react';
import { Octokit } from 'octokit';
import useStoreGithub from './github.store';

// Define las constantes fuera del hook
// const OWNER = 'CesarMartinez7';
// const REPO = 'TESTING-ELISA';


export const useGithubApi = () => {


  const REPO = useStoreGithub((state) => state.repo)
  const OWNER = useStoreGithub((state) => state.owner)
  

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [octokit, setOctokit] = useState(null);

  // Lógica de autenticación y persistencia del token
  useEffect(() => {
    const authenticate = async () => {
      let token = localStorage.getItem('githubToken');

      // Si no hay token en localStorage, se lo pedimos al usuario
      if (!token) {
        token = prompt('Por favor, ingresa tu Personal Access Token de GitHub:');
        if (token) {
          localStorage.setItem('githubToken', token);
        } else {
          setError(new Error('Token de GitHub no proporcionado.'));
          return;
        }
      }

      // Inicializar Octokit con el token
      try {
        const newOctokit = new Octokit({ auth: token });
        setOctokit(newOctokit);
        // Verificar que el token es válido
        const {
          data: { login },
        } = await newOctokit.rest.users.getAuthenticated();
        console.log('✅ Autenticado como:', login);
      } catch (err) {
        console.error('❌ Error de autenticación:', err);
        setError(new Error('Error de autenticación: El token proporcionado no es válido.'));
        localStorage.removeItem('githubToken'); // Eliminar token inválido
      }
    };
    authenticate();
  }, []);

  // Función para leer un archivo
  const getData = async (filePath) => {
    if (!octokit) {
      setError(new Error('Octokit no está inicializado. Asegúrate de que el token se haya proporcionado correctamente.'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await octokit.request(
        'GET /repos/{owner}/{repo}/contents/{path}',
        {
          owner: OWNER,
          repo: REPO,
          path: filePath,
          headers: { 'X-GitHub-Api-Version': '2022-11-28' },
        }
      );
      const decodedContent = atob(data.content);
      setData({ sha: data.sha, content: decodedContent });
      console.log('✅ Archivo leído:', filePath);
    } catch (err) {
      console.error('❌ Error leyendo archivo:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar o actualizar un archivo
  const saveCollection = async (collectionName, collection) => {
    if (!octokit) {
      setError(new Error('Octokit no está inicializado. Asegúrate de que el token se haya proporcionado correctamente.'));
      return;
    }
    setLoading(true);
    setError(null);
    const fileName = `${collectionName.replace(/\s/g, '-')}.json`;
    const filePath = `collections/${fileName}`;

    try {
      const existingFile = await getDataGithubInternal(filePath);
      const sha = existingFile?.sha || null;
      const content = JSON.stringify(collection, null, 2);
      const base64Content = btoa(content);
      const message = sha
        ? `Actualizar colección: ${collectionName}`
        : `Crear colección: ${collectionName}`;

      const response = await octokit.request(
        'PUT /repos/{owner}/{repo}/contents/{path}',
        {
          owner: OWNER,
          repo: REPO,
          path: filePath,
          message,
          committer: {
            name: 'CESAR octokit',
            email: 'cesarwamartinez@gmail.com',
          },
          content: base64Content,
          sha,
          headers: { 'X-GitHub-Api-Version': '2022-11-28' },
        }
      );
      setData(response.data);
      console.log('✅ Colección guardada:', response.data.content?.path);
    } catch (err) {
      console.error('❌ Error al guardar colección:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar interna para obtener el SHA, no expuesta en el hook
  const getDataGithubInternal = async (filePath) => {
    try {
      const { data } = await octokit.request(
        'GET /repos/{owner}/{repo}/contents/{path}',
        {
          owner: OWNER,
          repo: REPO,
          path: filePath,
          headers: { 'X-GitHub-Api-Version': '2022-11-28' },
        }
      );
      return { sha: data.sha, content: atob(data.content) };
    } catch (err) {
      console.error('❌ Error obteniendo archivo interno:', err);
      return null;
    }
  };

  return { data, loading, error, getData, saveCollection };
};