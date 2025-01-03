function Header() {
	return (
		<header>
			<h2>
				Welcome back, <span className="font-bold">John Doe</span>
			</h2>
		</header>
	);
}

function RecentWorkflows() {
	return (
		<section id="recent-workflows">
			<h4>Recent Workflows</h4>
		</section>
	);
}

function News() {
	return (
		<section id="news">
			<h4>News</h4>
		</section>
	);
}

function Templates() {
	return (
		<section id="templates">
			<h4>Templates</h4>
		</section>
	);
}

export function Component() {
	return (
		<>
			<Header />
			<News />
			<RecentWorkflows />
			<Templates />
		</>
	);
}
