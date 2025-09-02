import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { BaseModalLazy } from "../../../ui/lazy-components";
import useStoreGithub from "../services/github.store";
import { useGithubApi } from "../services/github";

const GithubModal = ({ isOpen, onClose }) => {
  const { token, setToken, owner, setOwner, setEmail, email, setRepo, repo } = useStoreGithub();
  const {authenticate} = useGithubApi()

  // Guardar en localStorage cuando cambian
  useEffect(() => {
    if (token) localStorage.setItem("githubToken", token);
    if (owner) localStorage.setItem("githubOwner", owner);
    if (repo) localStorage.setItem("githubRepo", repo);
    if (email) localStorage.setItem("githubEmail", email);
  }, [token, owner, repo, email]);

  // Cargar valores guardados al abrir modal
  useEffect(() => {
    if (isOpen) {
      const savedToken = localStorage.getItem("githubToken");
      const savedOwner = localStorage.getItem("githubOwner");
      const savedRepo = localStorage.getItem("githubRepo");
      const savedEmail = localStorage.getItem("githubEmail");
      if (savedToken) setToken(savedToken);
      if (savedOwner) setOwner(savedOwner);
      if (savedRepo) setRepo(savedRepo);
      if (savedEmail) setEmail(savedEmail);
    }
  }, [isOpen, setToken, setOwner, setRepo, setEmail]);

  return (
    <BaseModalLazy isOpen={isOpen} onClose={onClose}>
         <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl border border-zinc-300/50 dark:border-zinc-800/50 p-6 max-w-lg w-full mx-4 shadow-2xl"
          >
            <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
              Gestión de Colecciones en GitHub
            </h3>

            {/* Campos de entrada */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Token de Acceso (PAT):
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ec9b0]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email de Committer:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu-email@ejemplo.com"
                  className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ec9b0]"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    Propietario (Owner):
                  </label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="usuario"
                    className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ec9b0]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    Repositorio (Repo):
                  </label>
                  <input
                    type="text"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="mi-repo"
                    className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ec9b0]"
                  />
                </div>
              </div>
            </div>


            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={authenticate}
                className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
              >
                Autenticar
              </button>
            </div>
          </motion.div>
        </motion.div>
      
    </BaseModalLazy>
  );
};

export default GithubModal;
