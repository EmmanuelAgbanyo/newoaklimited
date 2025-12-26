import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, Clock, ChevronRight } from 'lucide-react';
import { BlogPost } from '../types';
import { db } from '../services/firebase';
import { ref, onValue } from 'firebase/database';
import { SEO, pageSEO, getBlogPostSEO } from '../components/SEO';

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={post.coverImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-gold text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {post.category}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center space-x-4 text-[10px] text-gray-400 mb-3">
          <span className="flex items-center space-x-1">
            <Calendar size={12} />
            <span>{formattedDate}</span>
          </span>
          <span className="flex items-center space-x-1">
            <User size={12} />
            <span>{post.author}</span>
          </span>
        </div>
        <h3 className="font-serif text-xl text-oak mb-3 group-hover:text-gold transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
        <span className="inline-flex items-center text-gold text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
          Read More <ChevronRight size={14} className="ml-1" />
        </span>
      </div>
    </Link>
  );
};

const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const postsRef = ref(db, 'blogPosts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: BlogPost[] = Object.keys(data)
          .map(key => ({
            ...data[key],
            id: key
          }))
          .filter((post: BlogPost) => post.published)
          .sort((a: BlogPost, b: BlogPost) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        setPosts(list);
        setFilteredPosts(list);

        const uniqueCategories = [...new Set(list.map((p: BlogPost) => p.category))];
        setCategories(uniqueCategories);
      } else {
        setPosts([]);
        setFilteredPosts([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, posts]);

  return (
    <div className="min-h-screen bg-white">
      <SEO {...pageSEO.blog} />
      {/* Hero Section */}
      <section className="relative bg-oak py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <p className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Insights & Updates</p>
            <h1 className="font-serif text-4xl md:text-6xl text-white mb-6">Our Blog</h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Stay informed with the latest news, market insights, and expert advice from the NewOak team.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="border-b border-gray-100">
          <div className="container mx-auto px-6">
            <div className="flex items-center space-x-4 py-6 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-oak text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                All Posts
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-oak text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <Clock size={48} className="mx-auto text-gray-200 mb-6" />
              <h3 className="font-serif text-2xl text-oak mb-2">Coming Soon</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                We're preparing valuable content for you. Check back soon for articles, insights, and updates.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const postsRef = ref(db, 'blogPosts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const foundPost = Object.keys(data)
          .map(key => ({ ...data[key], id: key }))
          .find((p: BlogPost) => p.slug === slug && p.published);

        setPost(foundPost || null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-oak mb-4">Post Not Found</h2>
          <p className="text-gray-500 mb-6">The article you're looking for doesn't exist.</p>
          <Link
            to="/blog"
            className="inline-flex items-center space-x-2 text-gold font-bold uppercase tracking-widest text-sm hover:underline"
          >
            <ArrowLeft size={16} />
            <span>Back to Blog</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white">
      <SEO {...getBlogPostSEO(post)} />
      {/* Hero */}
      <section className="relative h-[50vh] md:h-[60vh]">
        <img
          src={post.coverImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1600'}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-oak via-oak/50 to-transparent"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-12 md:pb-16">
            <button
              onClick={() => navigate('/blog')}
              className="inline-flex items-center space-x-2 text-gold text-[10px] font-bold uppercase tracking-widest mb-6 hover:underline"
            >
              <ArrowLeft size={14} />
              <span>Back to Blog</span>
            </button>
            <div className="max-w-3xl">
              <span className="inline-block bg-gold text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                {post.category}
              </span>
              <h1 className="font-serif text-3xl md:text-5xl text-white mb-6">{post.title}</h1>
              <div className="flex items-center space-x-6 text-sm text-gray-300">
                <span className="flex items-center space-x-2">
                  <User size={16} />
                  <span>{post.author}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{formattedDate}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div
              className="prose prose-lg prose-oak max-w-none"
              style={{
                lineHeight: '1.8',
                fontSize: '1.125rem'
              }}
            >
              {post.content.split('\n').map((paragraph, idx) => (
                paragraph.trim() ? (
                  <p key={idx} className="text-gray-700 mb-6">{paragraph}</p>
                ) : null
              ))}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center flex-wrap gap-2">
                  <Tag size={16} className="text-gray-400" />
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Back Button */}
            <div className="mt-12">
              <Link
                to="/blog"
                className="inline-flex items-center space-x-2 bg-oak text-white px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all"
              >
                <ArrowLeft size={14} />
                <span>Back to All Articles</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const Blog: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  if (slug) {
    return <BlogDetail />;
  }

  return <BlogList />;
};
