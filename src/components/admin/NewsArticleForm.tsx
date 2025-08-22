import React, { useState } from 'react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface Props {
  onSuccess?: () => void;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');

const NewsArticleForm: React.FC<Props> = ({ onSuccess }) => {
  const { user } = useSupabaseAuth();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    const { supabase } = await import('../../lib/supabase');

    const { error: insertError } = await supabase
      .from('news_articles')
      .insert({
        author_id: user.id,
        title,
        excerpt,
        content,
        image_url: imageUrl || null,
        category,
        slug: slugify(title),
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      setTitle('');
      setExcerpt('');
      setContent('');
      setImageUrl('');
      setCategory('');
      setTags('');
      setIsPublished(false);
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <Input label="Excerpt" value={excerpt} onChange={e => setExcerpt(e.target.value)} required />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors border-gray-200"
          rows={6}
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
      </div>
      <Input label="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      <Input label="Category" value={category} onChange={e => setCategory(e.target.value)} required />
      <Input
        label="Tags (comma separated)"
        value={tags}
        onChange={e => setTags(e.target.value)}
        helperText="e.g. shopping, dining"
      />
      <div className="flex items-center space-x-2">
        <input
          id="isPublished"
          type="checkbox"
          checked={isPublished}
          onChange={e => setIsPublished(e.target.checked)}
          className="h-4 w-4 text-brand-primary border-gray-300 rounded"
        />
        <label htmlFor="isPublished" className="text-sm text-gray-700">
          Published
        </label>
      </div>
      <Button type="submit" loading={loading} fullWidth>
        Create Article
      </Button>
    </form>
  );
};

export default NewsArticleForm;
