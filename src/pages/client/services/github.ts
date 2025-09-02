import { useState, useEffect } from 'react';
import { Octokit } from 'octokit';
import useStoreGithub from './github.store';

export const useGithubApi = () => {
  const REPO = useStoreGithub((state) => state.repo);
  const OWNER = useStoreGithub((state) => state.owner);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [octokit, setOctokit] = useState<Octokit | null>(null);

  // Lógica de autenticación y persistencia del token
  useEffect(() => {
    const authenticate = async () => {
      let token = localStorage.getItem('githubToken');

      // Inicializar Octokit (si hay token, autenticado; si no, sin auth)
      const newOctokit = token
        ? new Octokit({ auth: token })
        : new Octokit(); // <- público

      setOctokit(newOctokit);

      // Si hay token, probamos la autenticación
      if (token) {
        try {
          const {
            data: { login },
          } = await newOctokit.rest.users.getAuthenticated();
          console.log('✅ Autenticado como:', login);
        } catch (err) {
          console.error('❌ Token inválido:', err);
          setError(new Error('El token proporcionado no es válido.'));
          localStorage.removeItem('githubToken');
        }
      } else {
        console.log('⚠️ Sin token: usando API pública (limitada)');
      }
    };
    authenticate();
  }, []);

  // Función para leer un archivo
  const getData = async (filePath: string) => {
    if (!octokit) {
      setError(new Error('Octokit aún no está listo.'));
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
  const saveCollection = async (collectionName: string, collection: any) => {
    if (!octokit) {
      setError(new Error('Octokit no está listo.'));
      return;
    }

    // 🚨 Guardar colecciones sí requiere token, porque la API pública no deja escribir
    const token = localStorage.getItem('githubToken');
    if (!token) {
      setError(new Error('Necesitas un token para guardar colecciones.'));
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

  // Auxiliar para obtener SHA
  const getDataGithubInternal = async (filePath: string) => {
    try {
      const { data } = await octokit!.request(
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
