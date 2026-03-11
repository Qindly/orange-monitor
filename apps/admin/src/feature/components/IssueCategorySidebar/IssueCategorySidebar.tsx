import './IssueCategorySidebar.scss';
import { ISSUE_CATEGORIES } from '../../constants';
import type { IssueCategory } from '../../../styles/issue'

interface Props {
    activeCategory: IssueCategory;
    onChange: (category: IssueCategory) => void;
}

export function IssueCategorySidebar({ activeCategory, onChange }: Props) {
    return (
        <div className="issue-category-sidebar">
            <div className="issue-category-sidebar__brand">
                <div className="issue-category-sidebar__logo">M</div>
                <div>
                    <div className="issue-category-sidebar__title">Monitor Admin</div>
                    <div className="issue-category-sidebar__subtitle">异常聚合中心</div>
                </div>
            </div>

            <div className="issue-category-sidebar__nav">
                {ISSUE_CATEGORIES.map((item:any) => {
                    const active = item.key === activeCategory;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            className={`issue-category-sidebar__item ${active ? 'is-active' : ''}`}
                            onClick={() => onChange(item.key)}
                        >
                            <span className="issue-category-sidebar__item-title">{item.label}</span>
                            <span className="issue-category-sidebar__item-desc">{item.description}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}